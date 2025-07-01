// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IConnectorFactory {
    function deployConnector(
        bytes32 custodyId,
        bytes calldata data,
        address _whitelistedCaller
    ) external returns (address);
}
