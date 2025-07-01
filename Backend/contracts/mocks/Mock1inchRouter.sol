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

contract Mock1inchRouter {
    using SafeERC20 for IERC20;

    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }

    // Mock exchange rate (e.g., 1:1)
    uint256 public constant MOCK_EXCHANGE_RATE = 1e18;

    // Mock slippage (0.1%)
    uint256 public constant MOCK_SLIPPAGE = 999;

    event MockSwap(
        address srcToken,
        address dstToken,
        uint256 amount,
        uint256 returnAmount
    );

    function swap(
        address executor,
        SwapDescription calldata desc,
        bytes calldata data
    ) external payable returns (uint256 returnAmount, uint256 spentAmount) {
        // Calculate return amount based on mock exchange rate
        returnAmount = (desc.amount * MOCK_EXCHANGE_RATE) / 1e18;

        // Apply mock slippage
        returnAmount = (returnAmount * MOCK_SLIPPAGE) / 1000;

        // Ensure minimum return amount
        require(
            returnAmount >= desc.minReturnAmount,
            "Mock1inchRouter: Return amount too low"
        );

        // Handle native token swaps
        if (address(desc.srcToken) == address(0)) {
            require(
                msg.value == desc.amount,
                "Mock1inchRouter: Incorrect ETH amount"
            );
            desc.dstToken.safeTransfer(desc.dstReceiver, returnAmount);
        } else {
            // Handle ERC20 swaps
            desc.srcToken.safeTransferFrom(
                msg.sender,
                address(this),
                desc.amount
            );
            desc.dstToken.safeTransfer(desc.dstReceiver, returnAmount);
        }

        spentAmount = desc.amount;

        emit MockSwap(
            address(desc.srcToken),
            address(desc.dstToken),
            desc.amount,
            returnAmount
        );
    }

    // Function to set mock exchange rate for testing
    function setMockExchangeRate(uint256 _rate) external {
        // This is just a mock, in real tests you'd want to use a more sophisticated
        // mechanism to control the exchange rate
    }

    // Function to set mock slippage for testing
    function setMockSlippage(uint256 _slippage) external {
        // This is just a mock, in real tests you'd want to use a more sophisticated
        // mechanism to control the slippage
    }

    receive() external payable {}
}
