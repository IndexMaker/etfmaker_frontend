// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../OTCCustody/OTCCustody.sol";

interface IOTCIndex {
    /// @notice Emitted when collateral is deposited.
    event Deposit(
        uint256 amount,
        address from,
        bytes quote,
        address affiliate
    );

    /// @notice Emitted when a withdrawal is executed.
    event Withdraw(
        uint256 amount,
        address to,
        bytes executionReport
    );

    /// @notice Emitted when new index tokens are minted.
    event Mint(
        uint256 amount,
        address to,
        uint256 executionPrice,
        uint256 executionTime,
        address frontend
    );

    /// @notice Emitted when index tokens are burned.
    event Burn(
        uint256 amount,
        address to,
        uint256 chainId,
        address frontend
    );

    /// @notice Emitted when the per‐block mint cap changes.
    event MaxMintPerBlockChanged(
        uint256 oldMaxMintPerBlock,
        uint256 maxMintPerBlock
    );

    /// @notice Emitted when the per‐block redeem cap changes.
    event MaxRedeemPerBlockChanged(
        uint256 oldMaxRedeemPerBlock,
        uint256 maxRedeemPerBlock
    );

    /// @notice Emitted when the last price is updated by OTC Custody.
    event LastPriceUpdated(uint256 lastPrice);

    /// @notice Emitted each time the curator sets new weights and price.
    event CuratorUpdate(
        uint256 timestamp,
        bytes weights,
        uint256 price
    );

    /// @notice Emitted each time the solver sets new weights and price.
    event SolverUpdate(
        uint256 timestamp,
        bytes weights,
        uint256 price
    );

    /// @notice Mint `amount` of index tokens to `target`. Can only be called by OTC Custody.
    function mint(
        address target,
        uint256 amount,
        uint256 executionPrice,
        uint256 executionTime,
        address frontend
    ) external;

    /// @notice Burn `amount` of index tokens. Can only be called by OTC Custody.
    function burn(uint256 amount) external;

    /// @notice Deposit `amount` of collateral.  
    /// @param affiliate An affiliate address to credit (if any).  
    /// @param quote Arbitrary quote data.
    function deposit(
        uint256 amount,
        address affiliate,
        bytes calldata quote
    ) external;

    /// @notice Lock `amount` of index tokens from `msg.sender`, burning them on‐chain.  
    /// @param actionType User‐defined action code.  
    /// @param quote Arbitrary quote data.
    function lockToken(
        uint256 amount,
        uint8 actionType,
        bytes calldata quote
    ) external;

    /// @notice Unlock (re‐mint) `amount` of index tokens to `msg.sender`. Can only be called by OTC Custody.
    function unlockToken(uint256 amount) external;

    /// @notice Withdraw `amount` of collateral to `to`. Can only be called by OTC Custody.  
    /// @param v Proof data for OTC Custody.  
    /// @param executionReport Arbitrary execution data.
    function withdraw(
        uint256 amount,
        address to,
        OTCCustody.VerificationData calldata v,
        bytes calldata executionReport
    ) external;

    /// @notice Delegate voting power to `delegateTo`.
    function delegate(address delegateTo) external;

    /// @notice Cast a vote on `voteId`.  
    function vote(bytes32 voteId) external;

    /// @notice Initialize a new vote identified by `voteId`.  
    function initVote(bytes32 voteId) external;

    /// @notice After voting succeeds, finalize and update OTC Custody’s state.  
    function validateVote(
        bytes32 voteId,
        OTCCustody.VerificationData calldata v
    ) external;

    /// @notice Update the last price (only OTC Custody may call).  
    function updateLastPrice(uint256 _lastPrice) external;

    /// @notice Submit a curator update at `timestamp` with new `weights` and `price`. Only OTC Custody may call.  
    function curatorUpdate(
        uint256 timestamp,
        bytes calldata weights,
        uint256 price
    ) external;

    /// @notice Submit a solver update at `timestamp` with new `weights` and `price`. Only OTC Custody may call.  
    function solverUpdate(
        uint256 timestamp,
        bytes calldata weights,
        uint256 price
    ) external;

    /// @notice Update the vote parameters (only OTC Custody may call).  
    /// @dev only updated through updateCA following governance vote
    function updateVoteParameters(uint256 _voteThreshold, uint256 _votePeriod) external;

    /// @notice Returns the collateral token’s address.
    function getCollateralToken() external view returns (address);

    /// @notice Returns the collateral token’s precision.
    function getCollateralTokenPrecision() external view returns (uint256);

    /// @notice Returns (mintFee, burnFee, managementFee, performanceFee).
    function getFees()
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        );

    /// @notice Returns (maxMintPerBlock, maxRedeemPerBlock).
    function getLimits() external view returns (uint256, uint256);

    /// @notice Returns (snapshotBlock, voteCount, firstVoteTimestamp) for a given `voteId`.
    function getVoteData(bytes32 voteId)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    /// @notice Returns (curatorWeights, curatorPrice, solverWeights, solverPrice) at `timestamp`.
    function getWeightsAt(uint256 timestamp)
        external
        view
        returns (
            bytes memory,
            uint256,
            bytes memory,
            uint256
        );

    /// @notice Returns (mintedAmount, redeemedAmount) for the given `blockNumber`.
    function getMintedRedeemed(uint256 blockNumber)
        external
        view
        returns (
            uint256,
            uint256
        );

    /// @notice Returns how many tokens `user` has locked.
    function getLockedAmount(address user)
        external
        view
        returns (uint256);

    /// @notice Returns the delegated voter for `user`.
    function getDelegatedVoter(address user)
        external
        view
        returns (address);

    /// @notice Returns the last recorded price.
    function getLastPrice() external view returns (uint256);
}
