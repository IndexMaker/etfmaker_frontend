// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MockAaveConnector.sol";

contract AaveConnectorFactory {
    address public immutable otcCustodyAddress;

    constructor(address _otcCustodyAddress) {
        require(_otcCustodyAddress != address(0), "Invalid otcCustody address");
        otcCustodyAddress = _otcCustodyAddress;
    }

    // TODO: Accept bytes memory data, decode to params struct, validate params, pass to AaveConnector
    function deployConnector() external returns (address) {
        MockAaveConnector connector = new MockAaveConnector(otcCustodyAddress);
        return address(connector);
    }
}
