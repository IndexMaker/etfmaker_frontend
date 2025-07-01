// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./OTCIndex.sol";
import "../../interfaces/IConnectorFactory.sol";

contract IndexFactory is IConnectorFactory {
    event IndexDeployed(address indexed indexAddress);

    address public immutable otcCustodyAddress;

    constructor(address _otcCustodyAddress) {
        otcCustodyAddress = _otcCustodyAddress;
    }

    modifier onlyOTCCustody() {
        require(msg.sender == otcCustodyAddress, "Only otcCustody can call");
        _;
    }

    function deployConnector(
        bytes32 custodyId,
        bytes calldata data,
        address _whitelistedCaller
    ) external onlyOTCCustody returns (address) {
        (
            string memory _name,
            string memory _symbol,
            bytes32 _custodyIdFromData,
            address _collateralToken,
            uint256 _collateralTokenPrecision,
            uint256 _managementFee,
            uint256 _performanceFee,
            uint256 _maxMintPerBlock,
            uint256 _maxRedeemPerBlock,
            uint256 _voteThreshold,
            uint256 _votePeriod,
            uint256 _initialPrice
        ) = abi.decode(
            data,
            (string, string, bytes32, address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)
        );

        OTCIndex index = new OTCIndex(
            otcCustodyAddress,
            _name,
            _symbol,
            custodyId,
            _collateralToken,
            _collateralTokenPrecision,
            _managementFee,
            _performanceFee,
            _maxMintPerBlock,
            _maxRedeemPerBlock,
            _voteThreshold,
            _votePeriod,
            _initialPrice
        );
        
        emit IndexDeployed(address(index));
        return address(index);
    }

    // Legacy function for direct deployment (not through custody system)
    function deployIndex(
        string memory _name,
        string memory _symbol,
        bytes32 _custodyId,
        address _collateralToken,
        uint256 _collateralTokenPrecision,
        uint256 _managementFee,
        uint256 _performanceFee,
        uint256 _maxMintPerBlock,
        uint256 _maxRedeemPerBlock,
        uint256 _voteThreshold,
        uint256 _votePeriod,
        uint256 _initialPrice
    ) external onlyOTCCustody returns (address) {
        OTCIndex index = new OTCIndex(
            otcCustodyAddress,
            _name,
            _symbol,
            _custodyId,
            _collateralToken,
            _collateralTokenPrecision,
            _managementFee,
            _performanceFee,
            _maxMintPerBlock,
            _maxRedeemPerBlock,
            _voteThreshold,
            _votePeriod,
            _initialPrice
        );
        emit IndexDeployed(address(index));
        return address(index);
    }
}
