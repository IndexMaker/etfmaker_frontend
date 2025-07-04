// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library Bytes32ToAddress {
    /**************************************
     *              ERRORS                *
     **************************************/
    error InvalidBytes32();

    function toAddress(bytes32 _bytes32) internal pure returns (address) {
        checkAddress(_bytes32);
        return address(uint160(uint256(_bytes32)));
    }

    function toAddressUnchecked(
        bytes32 _bytes32
    ) internal pure returns (address) {
        return address(uint160(uint256(_bytes32)));
    }

    function checkAddress(bytes32 _bytes32) internal pure {
        if (uint256(_bytes32) >> 160 != 0) {
            revert InvalidBytes32();
        }
    }
}

library AddressToBytes32 {
    function toBytes32(address _address) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_address)));
    }
}

interface IV3SpokePool {
    struct V3RelayData {
        // The bytes32 that made the deposit on the origin chain.
        bytes32 depositor;
        // The recipient bytes32 on the destination chain.
        bytes32 recipient;
        // This is the exclusive relayer who can fill the deposit before the exclusivity deadline.
        bytes32 exclusiveRelayer;
        // Token that is deposited on origin chain by depositor.
        bytes32 inputToken;
        // Token that is received on destination chain by recipient.
        bytes32 outputToken;
        // The amount of input token deposited by depositor.
        uint256 inputAmount;
        // The amount of output token to be received by recipient.
        uint256 outputAmount;
        // Origin chain id.
        uint256 originChainId;
        // The id uniquely identifying this deposit on the origin chain.
        uint256 depositId;
        // The timestamp on the destination chain after which this deposit can no longer be filled.
        uint32 fillDeadline;
        // The timestamp on the destination chain after which any relayer can fill the deposit.
        uint32 exclusivityDeadline;
        // Data that is forwarded to the recipient.
        bytes message;
    }

    function depositV3(
        address depositor,
        address recipient,
        address inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 destinationChainId,
        address exclusiveRelayer,
        uint32 quoteTimestamp,
        uint32 fillDeadline,
        uint32 exclusivityDeadline,
        bytes calldata message
    ) external;

    function fillRelay(
        V3RelayData memory relayData,
        uint256 repaymentChainId,
        bytes32 repaymentAddress
    ) external;
}

contract MockSpokePool is IV3SpokePool {
    using Bytes32ToAddress for bytes32;
    using AddressToBytes32 for address;

    // Track deposits
    struct Deposit {
        bytes32 depositId;
        address depositor;
        address recipient;
        uint256 amount;
        address token;
        uint256 fillDeadline;
        bytes message;
        bool filled;
    }

    // Mapping to track deposits
    mapping(bytes32 => Deposit) public deposits;

    event DepositV3(
        address indexed depositor,
        address indexed token,
        uint256 amount,
        address indexed recipient,
        uint256 fillDeadline,
        bytes message,
        bytes32 depositId
    );

    event FillRelay(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        bytes message
    );

    // Simulate deposit
    function depositV3(
        address depositor,
        address recipient,
        address inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 destinationChainId,
        address exclusiveRelayer,
        uint32 quoteTimestamp,
        uint32 fillDeadline,
        uint32 exclusivityDeadline,
        bytes calldata message
    ) external override {
        IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);
        // Create deposit record
        bytes32 depositId = keccak256(
            abi.encodePacked(
                depositor.toBytes32(),
                recipient.toBytes32(),
                inputToken.toBytes32(),
                inputAmount,
                outputToken.toBytes32(),
                outputAmount,
                destinationChainId,
                message
            )
        );

        deposits[depositId] = Deposit({
            depositId: depositId,
            depositor: depositor,
            recipient: recipient,
            amount: outputAmount,
            token: outputToken,
            fillDeadline: fillDeadline,
            message: message,
            filled: false
        });

        emit DepositV3(
            depositor,
            inputToken,
            inputAmount,
            recipient,
            fillDeadline,
            message,
            depositId
        );
    }

    // Simulate relayer action
    function fillRelay(
        V3RelayData memory relayData,
        uint256 repaymentChainId,
        bytes32 repaymentAddress
    ) external override {
        bytes32 depositId = keccak256(
            abi.encodePacked(
                relayData.depositor,
                relayData.recipient,
                relayData.inputToken,
                relayData.inputAmount,
                relayData.outputToken,
                relayData.outputAmount,
                relayData.originChainId,
                relayData.message
            )
        );

        Deposit memory deposit = deposits[depositId]; // Dont call `storage`with `0` id
        require(deposit.amount > 0, "Deposit not found");
        require(!deposit.filled, "Deposit already filled");

        // Mark as filled
        deposits[depositId].filled = true;

        IERC20(deposit.token).transfer(deposit.recipient, deposit.amount);
        emit FillRelay(
            deposit.token,
            deposit.amount,
            deposit.recipient,
            deposit.message
        );
    }

    // Helper function to get deposit details
    function getDeposit(
        address depositor,
        address recipient,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount,
        uint256 destinationChainId,
        bytes calldata message
    ) external view returns (Deposit memory) {
        bytes32 depositId = keccak256(
            abi.encodePacked(
                depositor.toBytes32(),
                recipient.toBytes32(),
                inputToken.toBytes32(),
                inputAmount,
                outputToken.toBytes32(),
                outputAmount,
                destinationChainId,
                message
            )
        );
        return deposits[depositId];
    }

    function getDepositById(
        bytes32 depositId
    ) external view returns (Deposit memory) {
        return deposits[depositId];
    }
}
