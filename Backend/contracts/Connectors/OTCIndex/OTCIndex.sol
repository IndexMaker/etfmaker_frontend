// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../OTCCustody/OTCCustody.sol";

error MaxMintPerBlockExceeded();
error MaxRedeemPerBlockExceeded();
error OnlyOTCCustody();
error AlreadyVoted();
error VoteNotInitialized();
error NoVotingPower();
error VoteAlreadyInitialized();
error ThresholdNotMet();
error VoteExpired();

contract OTCIndex is ERC20Votes {
    using SafeERC20 for IERC20;

    event Deposit(uint256 amount, address from, uint256 seqNumNewOrderSingle, address affiliate1, address affiliate2);
    event Withdraw(uint256 amount, address to, bytes executionReport);
    event Mint(uint256 amount, address to, uint256 seqNumExecutionReport);
    event Burn(uint256 amount, address to, uint256 seqNumNewOrderSingle);
    event BurnBridge(uint256 amount, address to, uint256 seqNumCancel);
    event BridgeToken(uint256 amount, address indexed user, uint8 blockchainId);
    event MaxMintPerBlockChanged(uint256 oldMaxMintPerBlock, uint256 maxMintPerBlock);
    event MaxRedeemPerBlockChanged(uint256 oldMaxRedeemPerBlock, uint256 maxRedeemPerBlock);
    event LastPriceUpdated(uint256 lastPrice);
    event CuratorUpdate(uint256 timestamp, bytes weights, uint256 price);
    event SolverUpdate(uint256 timestamp, bytes weights, uint256 price);
    event LockToken(uint256 amount, address indexed user, uint256 seqNumNewOrderSingle);
    event UnlockToken(uint256 amount, address indexed user, uint256 seqNumCancel);
    event VoteParametersUpdated(uint256 newVoteThreshold, uint256 newVotePeriod);

    OTCCustody public immutable otcCustody;
    address public immutable otcCustodyAddress;
    bytes32 public custodyId;

    address public collateralToken;
    uint256 public collateralTokenPrecision;
    uint256 public managementFee;
    uint256 public performanceFee;

    uint256 public voteThreshold;
    uint256 public votePeriod;

    uint256 public lastPrice;

    mapping(uint256 => bytes) public curatorWeights;
    mapping(uint256 => uint256) public curatorPrice;
    mapping(uint256 => bytes) public solverWeights;
    mapping(uint256 => uint256) public solverPrice;

    mapping(uint256 => uint256) public mintedPerBlock;
    mapping(uint256 => uint256) public redeemedPerBlock;
    uint256 public maxMintPerBlock;
    uint256 public maxRedeemPerBlock;

    mapping(address => address) public delegatedVoter;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => uint256) public votes;
    mapping(bytes32 => uint256) public voteSnapshotBlock;
    mapping(bytes32 => uint256) public firstVoteTimestamp;

    mapping(address => uint256) public lockedAmount;

    constructor(
        address _otcCustodyAddress,
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
        uint256 _price
    ) ERC20Votes() ERC20(_name, _symbol) EIP712(_name, "1") {
        otcCustodyAddress = _otcCustodyAddress;
        otcCustody = OTCCustody(_otcCustodyAddress);
        custodyId = _custodyId;
        collateralToken = _collateralToken;
        collateralTokenPrecision = _collateralTokenPrecision;
        managementFee = _managementFee;
        performanceFee = _performanceFee;
        maxMintPerBlock = _maxMintPerBlock;
        maxRedeemPerBlock = _maxRedeemPerBlock;
        voteThreshold = _voteThreshold;
        votePeriod = _votePeriod;

        curatorPrice[block.timestamp] = _price;
        lastPrice = _price;
    }

    modifier belowMaxMintPerBlock(uint256 mintAmount) {
        if (mintedPerBlock[block.number] + mintAmount > maxMintPerBlock) revert MaxMintPerBlockExceeded();
        _;
    }

    modifier belowMaxRedeemPerBlock(uint256 redeemAmount) {
        if (redeemedPerBlock[block.number] + redeemAmount > maxRedeemPerBlock) revert MaxRedeemPerBlockExceeded();
        _;
    }

    modifier onlyOTCCustody() {
        if (msg.sender != otcCustodyAddress) revert OnlyOTCCustody();
        _;
    }

    function mint(
        address target,
        uint256 amount,
        uint256 seqNumExecutionReport
    ) external onlyOTCCustody belowMaxMintPerBlock(amount) {
        mintedPerBlock[block.number] += amount;
        _mint(target, amount);
        emit Mint(amount, target, seqNumExecutionReport);
    }


    // Legal Note : Solver is not responsible of USDC is blacklisted by circle or get usdc token is affected on chain supporter by Circle USDC issuer.
    
    //TODO add vote delegation of future minted tokens from this deposit interaciton.
    function deposit(uint256 amount, uint256 seqNumNewOrderSingle, address affiliate1, address affiliate2) external {
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);
            
        // Approve OTCCustody to spend the tokens
        IERC20(collateralToken).approve(address(otcCustody), amount);
        otcCustody.addressToCustody(custodyId, collateralToken, amount);
        IERC20(collateralToken).approve(address(otcCustody), 0);

        emit Deposit(amount, msg.sender, seqNumNewOrderSingle, affiliate1, affiliate2);
    }

    function lockToken(uint256 amount, uint256 seqNumNewOrderSingle) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        lockedAmount[msg.sender] += amount;
        _burn(msg.sender, amount);
        emit LockToken(amount, msg.sender, seqNumNewOrderSingle);
    }

     function bridgeToken(uint256 amount, uint8 blockchainId) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        lockedAmount[msg.sender] += amount;
        _burn(msg.sender, amount);
        emit BridgeToken(amount, msg.sender, blockchainId);
    }

    function burn(uint256 amount, address target, uint256 seqNumNewOrderSingle) external onlyOTCCustody belowMaxRedeemPerBlock(amount) {
        redeemedPerBlock[block.number] += amount;
        _burn(target, amount);
        lockedAmount[target] -= amount;
        emit Burn(amount, target, seqNumNewOrderSingle);
    }

    function burnBridge(uint256 amount, address target, uint256 seqNumCancel) external onlyOTCCustody belowMaxRedeemPerBlock(amount) {
        redeemedPerBlock[block.number] += amount;
        _burn(target, amount);
        lockedAmount[target] -= amount;
        emit BurnBridge(amount, target, seqNumCancel);
    }

    //@notice Only callable by solver
    function unlockToken(uint256 amount, address target, uint256 seqNumCancel) external onlyOTCCustody {
        lockedAmount[target] -= amount;
        _mint(target, amount);
        emit UnlockToken(amount, target, seqNumCancel);
    }   

    function withdraw(
        uint256 amount,
        address to,
        OTCCustody.VerificationData memory v,
        bytes calldata executionReport
    ) external onlyOTCCustody {
        otcCustody.custodyToAddress(collateralToken, to, amount, v);
        emit Withdraw(amount, to, executionReport);
    }

    function delegate(address delegateTo) public override {
        delegatedVoter[msg.sender] = delegateTo;
        super.delegate(delegateTo);
    }

    function vote(bytes32 voteId) public {
        address voter = delegatedVoter[msg.sender] == address(0) ? msg.sender : delegatedVoter[msg.sender];
        if (hasVoted[voteId][voter]) revert AlreadyVoted();
        if (voteSnapshotBlock[voteId] == 0) revert VoteNotInitialized();
        uint256 votingPower = getPastVotes(voter, voteSnapshotBlock[voteId]);
        if (votingPower == 0) revert NoVotingPower();
        hasVoted[voteId][voter] = true;
        votes[voteId] += votingPower;
    }

    function initVote(bytes32 voteId) public {
        if (voteSnapshotBlock[voteId] != 0) revert VoteAlreadyInitialized();
        voteSnapshotBlock[voteId] = block.number - 1;
        firstVoteTimestamp[voteId] = block.timestamp;
    }

    function validateVote(bytes32 voteId, OTCCustody.VerificationData memory v) public {
        if (votes[voteId] <= (voteThreshold * totalSupply()) / 100) revert ThresholdNotMet();
        if (block.timestamp > firstVoteTimestamp[voteId] + votePeriod) revert VoteExpired();
        otcCustody.updateCA(voteId, v);
    }

    function updateLastPrice(uint256 _lastPrice) public onlyOTCCustody {
        lastPrice = _lastPrice;
        emit LastPriceUpdated(lastPrice);
    }

    function curatorUpdate(uint256 _timestamp, bytes memory _weights, uint256 _price) public onlyOTCCustody {
        curatorWeights[_timestamp] = _weights;
        curatorPrice[_timestamp] = _price;
        emit CuratorUpdate(_timestamp, _weights, _price);
    }

    function solverUpdate(uint256 _timestamp, bytes memory _weights, uint256 _price) public onlyOTCCustody {
        solverWeights[_timestamp] = _weights;
        solverPrice[_timestamp] = _price;
        emit SolverUpdate(_timestamp, _weights, _price);
    }

    function updateVoteParameters(uint256 _voteThreshold, uint256 _votePeriod) external onlyOTCCustody {
        voteThreshold = _voteThreshold;
        votePeriod = _votePeriod;
        emit VoteParametersUpdated(_voteThreshold, _votePeriod);
    }

    function _setMaxMintPerBlock(uint256 _maxMintPerBlock) internal onlyOTCCustody {
        uint256 old = maxMintPerBlock;
        maxMintPerBlock = _maxMintPerBlock;
        emit MaxMintPerBlockChanged(old, maxMintPerBlock);
    }

    function _setMaxRedeemPerBlock(uint256 _maxRedeemPerBlock) internal onlyOTCCustody {
        uint256 old = maxRedeemPerBlock;
        maxRedeemPerBlock = _maxRedeemPerBlock;
        emit MaxRedeemPerBlockChanged(old, maxRedeemPerBlock);
    }

    function getCollateralToken() external view returns (address) {
        return collateralToken;
    }

    function getCollateralTokenPrecision() external view returns (uint256) {
        return collateralTokenPrecision;
    }

    function getFees() external view returns (uint256 _managementFee, uint256 _performanceFee) {
        return (managementFee, performanceFee);
    }

    function getLimits() external view returns (uint256 _maxMint, uint256 _maxRedeem) {
        return (maxMintPerBlock, maxRedeemPerBlock);
    }

    function getVoteData(bytes32 voteId) external view returns (uint256 snapshot, uint256 voteCount, uint256 firstVoteTime) {
        return (voteSnapshotBlock[voteId], votes[voteId], firstVoteTimestamp[voteId]);
    }

    function getWeightsAt(uint256 timestamp) external view returns (bytes memory curatorW, uint256 curatorP, bytes memory solverW, uint256 solverP) {
        return (curatorWeights[timestamp], curatorPrice[timestamp], solverWeights[timestamp], solverPrice[timestamp]);
    }

    function getMintedRedeemed(uint256 blockNumber) external view returns (uint256 minted, uint256 redeemed) {
        return (mintedPerBlock[blockNumber], redeemedPerBlock[blockNumber]);
    }

    function getLockedAmount(address user) external view returns (uint256) {
        return lockedAmount[user];
    }

    function getDelegatedVoter(address user) external view returns (address) {
        return delegatedVoter[user];
    }

    function getLastPrice() external view returns (uint256) {
        return lastPrice;
    }
}
