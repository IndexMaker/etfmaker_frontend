// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

using SafeERC20 for IERC20;

contract MockAaveConnector {
    address public immutable otcCustodyAddress;

    // TODO: Accept AaveConnector params in constructor
    constructor(address _otcCustodyAddress) {
        require(_otcCustodyAddress != address(0), "Invalid otcCustody address");
        otcCustodyAddress = _otcCustodyAddress;
    }

    modifier onlyOTCCustody() {
        require(msg.sender == otcCustodyAddress, "Only otcCustody can call");
        _;
    }

    function borrow(
        address _token,
        uint256 _minAmount
    ) external view onlyOTCCustody {
        // borrow minAmount of token
        console.log(
            "Borrow function called with arguments %s %s",
            _token,
            _minAmount
        );
    }

    function repay(
        address _token,
        uint256 _amount
    ) external view onlyOTCCustody {
        // repay amount of token
        console.log(
            "Borrow function called with arguments %s %s",
            _token,
            _amount
        );
    }

    function connectorToCustody(
        address _token,
        uint256 _amount
    ) external onlyOTCCustody {
        IERC20(_token).safeTransfer(otcCustodyAddress, _amount);
    }

    // function supply, withdraw
}
