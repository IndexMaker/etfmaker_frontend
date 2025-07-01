// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IAggregationRouterV6 {
    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }
}

contract OneInchConnector {
    using SafeERC20 for IERC20;

    IAggregationRouterV6 public immutable router;
    address public immutable otcCustody;

    event SwapExecuted(
        address srcToken,
        address dstToken,
        uint256 amountIn,
        uint256 amountOut
    );

    modifier onlyOTCCustody() {
        require(msg.sender == otcCustody, "Only OTCCustody can call");
        _;
    }

    constructor(address _router, address _otcCustody) {
        router = IAggregationRouterV6(_router);
        otcCustody = _otcCustody;
    }

    function executeSwap(
        bytes calldata swapData
    )
        external
        onlyOTCCustody
        returns (uint256 returnAmount, uint256 spentAmount)
    {
        // decode swapData
        bytes memory selector = swapData[4:]; // skip selector
        (, IAggregationRouterV6.SwapDescription memory desc, ) = abi.decode(
            selector,
            (address, IAggregationRouterV6.SwapDescription, bytes)
        );

        IERC20(desc.srcToken).approve(address(router), desc.amount);

        // Execute swap
        (bool success, bytes memory data) = address(router).call(swapData);
        if (!success) {
            revert("OneInchConnector: Swap failed");
        }
        (returnAmount, spentAmount) = abi.decode(data, (uint256, uint256));

        emit SwapExecuted(
            address(desc.srcToken),
            address(desc.dstToken),
            spentAmount,
            returnAmount
        );
    }

    receive() external payable {}
}
