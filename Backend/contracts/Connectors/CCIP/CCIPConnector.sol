// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "../../OTCCustody/OTCCustody.sol";
import "./CCIP.sol";
import "../../OTCCustody/Schnorr.sol";

contract CCIPConnector {
    using SafeERC20 for IERC20;

    OTCCustody public immutable otcCustody;
    CCIP public immutable ccipContract;
    address public immutable localCCIPReceiver;

    mapping(uint64 => bool) public destinationChainAllowed;

    // Add mapping for authorized callers
    mapping(address => bool) public whitelistedCallers;

    enum MessageType {
        UPDATE_CA,
        CUSTOM_ACTION
    }

    struct VerificationData {
        bytes32 id;
        uint8 state;
        uint256 timestamp;
        Schnorr.CAKey pubKey;
        Schnorr.Signature sig;
        bytes32[] merkleProof;
    }

    struct CCIPMessage {
        MessageType messageType;
        address targetConnector;
        bytes data;
    }

    event MessageSent(
        uint64 destinationChainSelector,
        address targetConnector,
        MessageType messageType,
        bytes data
    );
    event UpdateCAMessageReceived(
        bytes32 indexed custodyId,
        bytes32 newCA,
        uint256 timestamp
    );
    event DestinationChainAllowed(uint64 indexed chainSelector, bool allowed);
    event CustomActionMessageReceived(
        address indexed targetConnector,
        bytes data
    );
    event WhitelistedCallerChanged(address indexed caller, bool whitelisted);

    modifier onlyOTCCustody() {
        require(
            msg.sender == address(otcCustody),
            "CCIPConnector: Only otcCustody can call"
        );
        _;
    }

    // TEMPORARY: Only OTCCustody or whitelisted callers
    // WARNING: This is a temporary solution and should be removed after testing
    modifier onlyOTCCustodyOrWhitelistedCaller() {
        require(
            msg.sender == address(otcCustody) || whitelistedCallers[msg.sender],
            "CCIPConnector: Caller is not OTCCustody or whitelisted"
        );
        _;
    }

    modifier onlyLocalCCIPReceiver() {
        require(
            msg.sender == localCCIPReceiver,
            "CCIPConnector: Caller is not the local CCIPReceiver"
        );
        _;
    }

    modifier onlySelfOrotcCustody() {
        require(
            msg.sender == address(this) || msg.sender == address(otcCustody),
            "CCIPConnector: Caller is not self or OTCCustody"
        );
        _;
    }

    modifier onlyWhitelistedCaller() {
        require(
            whitelistedCallers[msg.sender],
            "CCIPConnector: Caller is not whitelisted"
        );
        _;
    }

    modifier allowedDestinationChain(uint64 _chainSelector) {
        require(
            destinationChainAllowed[_chainSelector],
            "CCIPConnector: Destination chain not allowed"
        );
        _;
    }

    constructor(
        address _otcCustodyAddress,
        address _ccipContractAddress,
        address _localCCIPReceiverAddress,
        address _whitelistedCaller
    ) {
        require(
            _otcCustodyAddress != address(0),
            "CCIPConnector: Invalid otcCustody address"
        );
        require(
            _ccipContractAddress != address(0),
            "CCIPConnector: Invalid CCIP contract address"
        );
        require(
            _localCCIPReceiverAddress != address(0),
            "CCIPConnector: Invalid local CCIPReceiver address"
        );

        otcCustody = OTCCustody(_otcCustodyAddress);
        ccipContract = CCIP(payable(_ccipContractAddress));
        localCCIPReceiver = _localCCIPReceiverAddress;
        whitelistedCallers[_whitelistedCaller] = true;
    }

    function setWhitelistedCaller(
        address caller,
        bool whitelisted
    ) external onlyOTCCustodyOrWhitelistedCaller {
        require(caller != address(0), "CCIPConnector: Invalid caller address");
        whitelistedCallers[caller] = whitelisted;
        emit WhitelistedCallerChanged(caller, whitelisted);
    }

    function setDestinationChain(
        uint64 _chainSelector,
        bool _allowed
    ) external onlyWhitelistedCaller {
        destinationChainAllowed[_chainSelector] = _allowed;
        emit DestinationChainAllowed(_chainSelector, _allowed);
    }

    function sendUpdateCA(
        uint64 _destinationChainSelector,
        address _destinationTargetConnector,
        VerificationData calldata _verificationData,
        address _feeToken
    )
        external
        onlyWhitelistedCaller
        allowedDestinationChain(_destinationChainSelector)
        returns (bytes32 messageId)
    {
        require(
            _destinationTargetConnector != address(0),
            "CCIPConnector: Invalid destination target Connector"
        );

        bytes32 _newCA = otcCustody.getCA(_verificationData.id);

        CCIPMessage memory message = CCIPMessage({
            messageType: MessageType.UPDATE_CA,
            targetConnector: _destinationTargetConnector,
            data: abi.encode(_newCA, _verificationData)
        });

        bytes memory encodedCCIPMessage = abi.encode(message);

        messageId = ccipContract.sendMessage(
            _destinationChainSelector,
            encodedCCIPMessage,
            _feeToken
        );

        emit MessageSent(
            _destinationChainSelector,
            _destinationTargetConnector,
            MessageType.UPDATE_CA,
            message.data
        );
    }

    function sendCustomMessage(
        uint64 _destinationChainSelector,
        address _destinationTargetConnector,
        bytes calldata _customData,
        address _feeToken
    )
        external
        onlyOTCCustody
        allowedDestinationChain(_destinationChainSelector)
    {
        require(
            _destinationTargetConnector != address(0),
            "CCIPConnector: Invalid destination target Connector"
        );

        CCIPMessage memory message = CCIPMessage({
            messageType: MessageType.CUSTOM_ACTION,
            targetConnector: _destinationTargetConnector,
            data: _customData
        });

        bytes memory encodedCCIPMessage = abi.encode(message);

        ccipContract.sendMessage(
            _destinationChainSelector,
            encodedCCIPMessage,
            _feeToken
        );

        emit MessageSent(
            _destinationChainSelector,
            _destinationTargetConnector,
            MessageType.CUSTOM_ACTION,
            _customData
        );
    }

    function handleCCIPMessage(
        bytes calldata _encodedMessage
    ) external onlyLocalCCIPReceiver {
        CCIPMessage memory decodedMessage = abi.decode(
            _encodedMessage,
            (CCIPMessage)
        );

        require(
            decodedMessage.targetConnector == address(this),
            "CCIPConnector: Message not intended for this Connector"
        );

        if (decodedMessage.messageType == MessageType.UPDATE_CA) {
            (bytes32 newCA, VerificationData memory verificationData) = abi
                .decode(decodedMessage.data, (bytes32, VerificationData));
            _executeUpdateCA(newCA, verificationData);
            emit UpdateCAMessageReceived(
                verificationData.id,
                newCA,
                verificationData.timestamp
            );
        } else if (decodedMessage.messageType == MessageType.CUSTOM_ACTION) {
            emit CustomActionMessageReceived(
                decodedMessage.targetConnector,
                decodedMessage.data
            );
        }
    }

    function _executeUpdateCA(
        bytes32 _newCA,
        VerificationData memory _verificationData
    ) internal {
        OTCCustody.VerificationData
            memory otcCustodyVerificationData = OTCCustody.VerificationData({
                id: _verificationData.id,
                state: _verificationData.state,
                timestamp: _verificationData.timestamp,
                pubKey: _verificationData.pubKey,
                sig: _verificationData.sig,
                merkleProof: _verificationData.merkleProof
            });

        otcCustody.updateCA(_newCA, otcCustodyVerificationData);
    }

    function approveToken(
        address _token,
        address _spender,
        uint256 _amount
    ) public onlyWhitelistedCaller {
        IERC20(_token).approve(_spender, _amount);
    }
}
