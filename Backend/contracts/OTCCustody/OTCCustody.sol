// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Schnorr.sol";
import "./VerificationUtils.sol";
import "../interfaces/IConnectorFactory.sol";

contract OTCCustody {
    using SafeERC20 for IERC20;

    struct VerificationData {
        bytes32 id;
        uint8 state;
        uint256 timestamp;
        Schnorr.CAKey pubKey;
        Schnorr.Signature sig;
        bytes32[] merkleProof;
    }

    event CAUpdated(bytes32 indexed id, bytes32 ca, uint256 timestamp);
    event CustodyStateChanged(bytes32 indexed id, uint8 newState);
    event ConnectorDeployed(
        bytes32 indexed id,
        address factoryAddress,
        address connectorAddress
    );
    event addressToCustodyEvent(
        bytes32 indexed id,
        address token,
        uint256 amount
    );
    event custodyToCustodyEvent(
        bytes32 indexed id,
        bytes32 receiverId,
        address token,
        uint256 amount
    );
    event custodyToAddressEvent(
        bytes32 indexed id,
        address token,
        address destination,
        uint256 amount
    );
    event custodyToConnectorEvent(
        bytes32 indexed id,
        address token,
        address connectorAddress,
        uint256 amount
    );
    event callConnectorEvent(
        bytes32 indexed id,
        string connectorType,
        address connectorAddress,
        bytes fixedCallData,
        bytes tailCallData
    );
    event withdrawReRoutingEvent(
        bytes32 indexed id,
        address sender,
        address destination
    );
    event submitProvisionalEvent(
        bytes32 indexed id,
        bytes _calldata,
        bytes _msg
    );
    event revokeProvisionalEvent(
        bytes32 indexed id,
        bytes _calldata,
        bytes _msg
    );
    event discussProvisionalEvent(bytes32 indexed id, bytes _msg);

    mapping(bytes32 => bytes32) private custodys;
    mapping(bytes32 => mapping(address => uint256)) public custodyBalances; // custodyId => token address => balance
    mapping(address => bytes32) public connectorToCustody; // deployed Connector address => custodyId
    mapping(bytes32 => address) public custodyOwners; // custodyId => owner address
    mapping(bytes32 => bool) private nullifier;
    mapping(bytes32 => uint256) public lastConnectorUpdateTimestamp; // custodyId => timestamp
    mapping(bytes32 => bytes32) private CAs;
    mapping(bytes32 => uint8) private custodyState;
    mapping(bytes32 => mapping(uint256 => bytes)) public custodyMsg; // custodyId => token address => balance
    mapping(bytes32 => uint256) private custodyMsgLength;

    mapping(bytes32 => mapping(address => address)) private withdrawReRoutings; // custodyId => address => address // used for instant withdraw

    modifier checkCustodyState(bytes32 id, uint8 state) {
        require(custodyState[id] == state, "State isn't 0");
        _;
    }

    modifier checkCustodyBalance(
        bytes32 id,
        address token,
        uint256 amount
    ) {
        require(custodyBalances[id][token] >= amount, "Out of collateral");
        _;
    }

    modifier checkNullifier(bytes32 _nullifier) {
        require(!nullifier[_nullifier], "Nullifier has been used");
        nullifier[_nullifier] = true;
        _;
    }

    modifier checkExpiry(uint256 _timestamp) {
        require(_timestamp <= block.timestamp, "Signature expired");
        _;
    }

    function addressToCustody(
        bytes32 id,
        address token,
        uint256 amount
    ) external {
        require(id != bytes32(0), "Invalid custody ID");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        custodyBalances[id][token] += amount;
        initCA(id);
        emit addressToCustodyEvent(id, token, amount);
    }

    function custodyToAddress(
        address token,
        address destination,
        uint256 amount,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkCustodyBalance(v.id, token, amount)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        initCA(v.id);
        VerificationUtils.verifyLeaf(
            CAs[v.id],
            v.merkleProof,
            "custodyToAddress",
            block.chainid,
            address(this),
            custodyState[v.id],
            abi.encode(destination),
            v.pubKey.parity,
            v.pubKey.x
        );
        VerificationUtils.verifySchnorr(
            abi.encode(
                v.timestamp,
                "custodyToAddress",
                v.id,
                token,
                destination,
                amount
            ),
            v.pubKey,
            v.sig
        );
        if (withdrawReRoutings[v.id][destination] != address(0)) {
            custodyBalances[v.id][token] -= amount;
            IERC20(token).safeTransfer(
                withdrawReRoutings[v.id][destination],
                amount
            );
        } else {
            custodyBalances[v.id][token] -= amount;
            IERC20(token).safeTransfer(destination, amount);
        }
        emit custodyToAddressEvent(v.id, token, destination, amount);
    }

    function custodyToCustody(
        address token,
        bytes32 receiverId,
        uint256 amount,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkCustodyBalance(v.id, token, amount)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        initCA(v.id);
        VerificationUtils.verifyLeaf(
            CAs[v.id],
            v.merkleProof,
            "custodyToCustody",
            block.chainid,
            address(this),
            custodyState[v.id],
            abi.encode(receiverId),
            v.pubKey.parity,
            v.pubKey.x
        );

        VerificationUtils.verifySchnorr(
            abi.encode(
                v.timestamp,
                "custodyToCustody",
                v.id,
                token,
                receiverId,
                amount
            ),
            v.pubKey,
            v.sig
        );

        //@audit No CTC in state 1 to not shortcut instant withdraw
        require(custodyState[v.id] != 1, "Custody in dispute mode");
        custodyBalances[v.id][token] -= amount;
        custodyBalances[receiverId][token] += amount;

        emit custodyToCustodyEvent(v.id, receiverId, token, amount);
    }

    function custodyToConnector(
        address token,
        address connectorAddress,
        uint256 amount,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkCustodyBalance(v.id, token, amount)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        bytes32 custodyId = connectorToCustody[connectorAddress]; // custodyId bound to connector if the connector is deployed via deployConnector
        if (custodyId != bytes32(0)) {
            require(
                custodyOwners[custodyId] == msg.sender,
                "Only custody owner can call the whitelisted connector directly"
            );
        } else {
            initCA(v.id);
            VerificationUtils.verifyLeaf(
                CAs[v.id],
                v.merkleProof,
                "custodyToConnector",
                block.chainid,
                address(this),
                custodyState[v.id],
                abi.encode(connectorAddress, token),
                v.pubKey.parity,
                v.pubKey.x
            );
        }

        VerificationUtils.verifySchnorr(
            abi.encode(
                v.timestamp,
                "custodyToConnector",
                v.id,
                token,
                connectorAddress,
                amount
            ),
            v.pubKey,
            v.sig
        );

        custodyBalances[v.id][token] -= amount;
        IERC20(token).safeTransfer(connectorAddress, amount);
    }

    function updateCA(
        bytes32 _newCA,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        require(
            v.timestamp > lastConnectorUpdateTimestamp[v.id],
            "Signature expired"
        );
        initCA(v.id);
        VerificationUtils.verifyLeaf(
            CAs[v.id],
            v.merkleProof,
            "updateCA",
            block.chainid,
            address(this),
            custodyState[v.id],
            abi.encode(), // no extra parameters
            v.pubKey.parity,
            v.pubKey.x
        );

        VerificationUtils.verifySchnorr(
            abi.encode(v.timestamp, "updateCA", v.id, _newCA),
            v.pubKey,
            v.sig
        );

        CAs[v.id] = _newCA;
        lastConnectorUpdateTimestamp[v.id] = v.timestamp;
        emit CAUpdated(v.id, _newCA, v.timestamp);
    }

    function deployConnector(
        string calldata _connectorType,
        address _factoryAddress,
        bytes calldata _data,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        require(
            v.timestamp > lastConnectorUpdateTimestamp[v.id],
            "Signature expired"
        );
        initCA(v.id);
        VerificationUtils.verifyLeaf(
            CAs[v.id],
            v.merkleProof,
            "deployConnector",
            block.chainid,
            address(this),
            custodyState[v.id],
            abi.encode(_connectorType, _factoryAddress, _data),
            v.pubKey.parity,
            v.pubKey.x
        );

        VerificationUtils.verifySchnorr(
            abi.encode(
                v.timestamp,
                "deployConnector",
                v.id,
                _connectorType,
                _factoryAddress,
                _data
            ),
            v.pubKey,
            v.sig
        );

        address connectorAddress = IConnectorFactory(_factoryAddress)
            .deployConnector(v.id, _data, msg.sender);
        connectorToCustody[connectorAddress] = v.id;
        emit ConnectorDeployed(v.id, _factoryAddress, connectorAddress);
    }

    function callConnector(
        string calldata connectorType,
        address connectorAddress,
        bytes calldata fixedCallData,
        bytes calldata tailCallData,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        bytes32 custodyId = connectorToCustody[connectorAddress]; // custodyId bound to connector if the connector is deployed via deployConnector
        if (custodyId != bytes32(0)) {
            require(
                custodyOwners[custodyId] == msg.sender,
                "Only custody owner can call the whitelisted connector directly"
            );
        } else {
            initCA(v.id);
            VerificationUtils.verifyLeaf(
                CAs[v.id],
                v.merkleProof,
                "callConnector",
                block.chainid,
                address(this),
                custodyState[v.id],
                abi.encode(connectorType, connectorAddress, fixedCallData),
                v.pubKey.parity,
                v.pubKey.x
            );
        }

        bytes memory fullCallData = bytes.concat(fixedCallData, tailCallData);
        VerificationUtils.verifySchnorr(
            abi.encode(
                v.timestamp,
                "callConnector",
                v.id,
                connectorType,
                connectorAddress,
                fullCallData
            ),
            v.pubKey,
            v.sig
        );

        (bool success, ) = connectorAddress.call(fullCallData);
        require(success, "Connector call failed");

        emit callConnectorEvent(
            v.id,
            connectorType,
            connectorAddress,
            fixedCallData,
            tailCallData
        );
    }

    function updateCustodyState(
        uint8 state,
        VerificationData calldata v
    )
        external
        checkCustodyState(v.id, v.state)
        checkExpiry(v.timestamp)
        checkNullifier(v.sig.e)
    {
        initCA(v.id);
        VerificationUtils.verifyLeaf(
            CAs[v.id],
            v.merkleProof,
            "changeCustodyState",
            block.chainid,
            address(this),
            custodyState[v.id],
            abi.encode(state),
            v.pubKey.parity,
            v.pubKey.x
        );

        VerificationUtils.verifySchnorr(
            abi.encode(v.timestamp, "changeCustodyState", v.id, state),
            v.pubKey,
            v.sig
        );

        custodyState[v.id] = state;
        emit CustodyStateChanged(v.id, state);
    }

    function initCA(bytes32 id) internal {
        if (CAs[id] == bytes32(0)) {
            CAs[id] = id;
            custodyOwners[id] = msg.sender;
        }
    }

    /// OTCCourt
    function withdrawReRouting(bytes32 id, address destination) public {
        // buy the right of redirecting claims from a dispute // managed in external contract
        require(
            withdrawReRoutings[id][msg.sender] == address(0),
            "Already the custody owner"
        );
        withdrawReRoutings[id][msg.sender] = destination;
        emit withdrawReRoutingEvent(id, msg.sender, destination);
    }

    // Read functions

    function getCustodyState(bytes32 id) external view returns (uint8) {
        return custodyState[id];
    }

    function getCA(bytes32 id) external view returns (bytes32) {
        return CAs[id];
    }

    function getCustodyBalances(
        bytes32 id,
        address token
    ) external view returns (uint256) {
        return custodyBalances[id][token];
    }

    function isConnectorWhitelisted(
        address connectorAddress
    ) external view returns (bool) {
        return connectorToCustody[connectorAddress] != bytes32(0);
    }

    function getConnectorCustodyId(
        address connectorAddress
    ) external view returns (bytes32) {
        return connectorToCustody[connectorAddress];
    }

    function getCustodyOwner(bytes32 id) external view returns (address) {
        return custodyOwners[id];
    }

    function getLastConnectorUpdateTimestamp(
        bytes32 id
    ) external view returns (uint256) {
        return lastConnectorUpdateTimestamp[id];
    }

    function getNullifier(bytes32 _nullifier) external view returns (bool) {
        return nullifier[_nullifier];
    }

    function getCustodyMsg(
        bytes32 id,
        uint256 msgId
    ) external view returns (bytes memory) {
        return custodyMsg[id][msgId];
    }

    function getCustodyMsgLength(bytes32 id) external view returns (uint256) {
        return custodyMsgLength[id];
    }
}
