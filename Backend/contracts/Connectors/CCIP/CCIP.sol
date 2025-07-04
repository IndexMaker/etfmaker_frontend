// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CCIP {
    using SafeERC20 for IERC20;

    IRouterClient public immutable router;
    address public whitelistedCaller;
    address public sourceCCIPConnector;
    mapping(uint64 => address) public destinationCCIPReceivers;

    event CCIPMessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        bytes data,
        address feeToken,
        uint256 fees
    );
    event SourceCCIPConnectorUpdated(address indexed connector);
    event DestinationCCIPReceiverUpdated(
        uint64 indexed chainSelector,
        address indexed receiverAddress
    );
    event CallerWhitelisted(address indexed caller, bool status);

    modifier onlyWhitelistedCaller() {
        require(
            msg.sender == whitelistedCaller,
            "CCIP: Caller not whitelisted"
        );
        _;
    }

    constructor(address _router) {
        require(_router != address(0), "CCIP: Invalid router address");
        router = IRouterClient(_router);
        whitelistedCaller = msg.sender;
    }

    function setWhitelistedCaller(
        address _whitelistedCaller
    ) external onlyWhitelistedCaller {
        whitelistedCaller = _whitelistedCaller;
    }

    function setSourceCCIPConnector(
        address _connector
    ) external onlyWhitelistedCaller {
        sourceCCIPConnector = _connector;
        emit SourceCCIPConnectorUpdated(_connector);
    }

    function setDestinationCCIPReceiver(
        uint64 _chainSelector,
        address _receiverAddress
    ) external onlyWhitelistedCaller {
        require(
            _receiverAddress != address(0),
            "CCIP: Invalid CCIPReceiver address"
        );
        destinationCCIPReceivers[_chainSelector] = _receiverAddress;
        emit DestinationCCIPReceiverUpdated(_chainSelector, _receiverAddress);
    }

    function sendMessage(
        uint64 _destinationChainSelector,
        bytes calldata _encodedCCIPMessage,
        address _feeToken
    ) external returns (bytes32 messageId) {
        require(
            msg.sender == sourceCCIPConnector,
            "CCIP: Caller not source CCIPConnector"
        );
        address receiverOnDestinationChain = destinationCCIPReceivers[
            _destinationChainSelector
        ];
        require(
            receiverOnDestinationChain != address(0),
            "CCIP: Destination CCIPReceiver not configured"
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverOnDestinationChain),
            data: _encodedCCIPMessage,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: _feeToken
        });

        uint256 fees = router.getFee(_destinationChainSelector, message);

        if (_feeToken != address(0)) {
            IERC20(_feeToken).safeTransferFrom(msg.sender, address(this), fees);
            IERC20(_feeToken).approve(address(router), fees);
            messageId = router.ccipSend(_destinationChainSelector, message);
        } else {
            messageId = router.ccipSend{value: fees}(
                _destinationChainSelector,
                message
            );
        }

        emit CCIPMessageSent(
            messageId,
            _destinationChainSelector,
            receiverOnDestinationChain,
            _encodedCCIPMessage,
            _feeToken,
            fees
        );

        return messageId;
    }

    receive() external payable {}
}
