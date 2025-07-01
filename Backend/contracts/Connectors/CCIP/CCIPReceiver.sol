// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IAny2EVMMessageReceiver.sol";
import "./CCIPConnector.sol";

contract CCIPReceiver is IAny2EVMMessageReceiver {
    IRouterClient public immutable router;
    address public whitelistedCaller;

    mapping(uint64 => mapping(address => bool)) public whitelistedSourceSenders;
    mapping(address => bool) public whitelistedLocalDestinations;

    event MessageReceivedAndForwarded(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sourceSender,
        address targetConnector,
        bytes data
    );
    event SourceSenderWhitelisted(
        uint64 indexed chainSelector,
        address indexed senderAddress,
        bool status
    );
    event LocalDestinationWhitelisted(
        address indexed destinationConnector,
        bool status
    );

    modifier onlyWhitelistedCaller() {
        require(
            whitelistedCaller == msg.sender,
            "CCIPReceiver: Caller not whitelisted"
        );
        _;
    }

    constructor(address _routerAddress, address _whitelistedCaller) {
        require(
            _routerAddress != address(0),
            "CCIPReceiver: Invalid router address"
        );
        router = IRouterClient(_routerAddress);
        whitelistedCaller = _whitelistedCaller;
    }

    function setWhitelistedCaller(
        address _whitelistedCaller
    ) external onlyWhitelistedCaller {
        whitelistedCaller = _whitelistedCaller;
    }

    function setSourceSenderWhitelist(
        uint64 _sourceChainSelector,
        address _sourceCCIPContractAddress,
        bool _status
    ) external onlyWhitelistedCaller {
        require(
            _sourceCCIPContractAddress != address(0),
            "CCIPReceiver: Invalid source CCIP contract address"
        );
        whitelistedSourceSenders[_sourceChainSelector][
            _sourceCCIPContractAddress
        ] = _status;
        emit SourceSenderWhitelisted(
            _sourceChainSelector,
            _sourceCCIPContractAddress,
            _status
        );
    }

    function setLocalDestinationWhitelist(
        address _localCCIPConnectorAddress,
        bool _status
    ) external onlyWhitelistedCaller {
        require(
            _localCCIPConnectorAddress != address(0),
            "CCIPReceiver: Invalid local CCIPConnector address"
        );
        whitelistedLocalDestinations[_localCCIPConnectorAddress] = _status;
        emit LocalDestinationWhitelisted(_localCCIPConnectorAddress, _status);
    }

    function ccipReceive(
        Client.Any2EVMMessage memory message
    ) external override {
        require(
            msg.sender == address(router),
            "CCIPReceiver: Caller is not the CCIP Router"
        );

        address sourceCCIPContract = abi.decode(message.sender, (address));
        require(
            whitelistedSourceSenders[message.sourceChainSelector][
                sourceCCIPContract
            ],
            "CCIPReceiver: Source CCIP contract not whitelisted for this chain selector"
        );

        CCIPConnector.CCIPMessage memory decodedCCIPMessage = abi.decode(
            message.data,
            (CCIPConnector.CCIPMessage)
        );

        address targetLocalConnector = decodedCCIPMessage.targetConnector;

        require(
            whitelistedLocalDestinations[targetLocalConnector],
            "CCIPReceiver: Target local Connector not whitelisted"
        );

        (bool success, ) = targetLocalConnector.call(
            abi.encodeWithSelector(
                CCIPConnector.handleCCIPMessage.selector,
                message.data
            )
        );
        require(
            success,
            "CCIPReceiver: Failed to forward message to target Connector"
        );

        emit MessageReceivedAndForwarded(
            message.messageId,
            message.sourceChainSelector,
            sourceCCIPContract,
            targetLocalConnector,
            message.data
        );
    }

    receive() external payable {}
}
