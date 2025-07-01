// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/V3SpokePoolInterface.sol";
import "../../OTCCustody/OTCCustody.sol";
using SafeERC20 for IERC20;

contract AcrossConnector {
    OTCCustody public immutable otcCustody;
    V3SpokePoolInterface public spokePool;

    modifier onlyOTCCustody() {
        require(msg.sender == address(otcCustody), "Only otcCustody can call");
        _;
    }

    // TODO: Accept AaveConnector params in constructor
    constructor(address _spokePoolAddress, address _otcCustodyAddress) {
        require(_otcCustodyAddress != address(0), "Invalid otcCustody address");
        otcCustody = OTCCustody(_otcCustodyAddress);
        spokePool = V3SpokePoolInterface(_spokePoolAddress);
    }

    function deposit(
        address _recipient,
        address _inputToken,
        address _outputToken,
        uint256 _amount,
        uint256 _minAmount,
        uint256 _destinationChainId,
        address _exclusiveRelayer,
        uint32 _fillDeadline,
        uint32 _exclusivityDeadline,
        bytes calldata _message
    ) external onlyOTCCustody {
        IERC20(_inputToken).approve(address(spokePool), _amount);
        spokePool.depositV3(
            address(this), // address depositor,
            _recipient, // address recipient,
            _inputToken, // address inputToken,
            _outputToken, // address outputToken,
            _amount, // uint256 inputAmount,
            _minAmount, // uint256 outputAmount,
            _destinationChainId, // uint256 destinationChainId,
            _exclusiveRelayer, // address exclusiveRelayer,
            uint32(block.timestamp), // uint32 quoteTimestamp,
            _fillDeadline, // uint32 fillDeadline,
            _exclusivityDeadline, // uint32 exclusivityDeadline,
            _message // bytes calldata message
        );
    }
}
