// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../OTCCustody/OTCCustody.sol";

contract OTCSMA {
    using SafeERC20 for IERC20;

    struct SMAInfo {
        address owner;
        uint256 preLockWithdrawFee;
        uint256 lockPeriod;
        uint256 managementFee;
        uint256 performanceFee;
        uint256 startTimestamp;
        address curator;
        bytes32 custodyId;
        bool accepted;
        address token;
        uint256 amount;
    }

    error NotCurator();
    error NotOwner();
    error SMAAlreadyAccepted();
    error SMANotAccepted();
    error InvalidAmount();

    event AskWithdraw(uint256 indexed smaId, uint256 share);

    address public immutable OTCCustodyAddress;
    OTCCustody public immutable otcCustody;

    mapping(uint256 => SMAInfo) public sma;
    mapping(uint256 => address) public forceWithdrawCurator;
    uint256 public smaCount;

    constructor(address _OTCCustodyAddress) {
        OTCCustodyAddress = _OTCCustodyAddress;
        otcCustody = OTCCustody(_OTCCustodyAddress);
    }

    function createSMA(
        bytes32 _custodyId,
        uint256 _preLockWithdrawFee,
        uint256 _lockPeriod,
        uint256 _managementFee,
        uint256 _performanceFee,
        address _token,
        uint256 _amount
    ) external {
        sma[smaCount] = SMAInfo({
            owner: msg.sender,
            preLockWithdrawFee: _preLockWithdrawFee,
            lockPeriod: _lockPeriod,
            managementFee: _managementFee,
            performanceFee: _performanceFee,
            startTimestamp: block.timestamp,
            curator: msg.sender,
            custodyId: _custodyId,
            accepted: false,
            token: _token,
            amount: _amount
        });

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        smaCount++;
    }

    function acceptSMA(uint256 _smaId) external {
        SMAInfo storage info = sma[_smaId];
        if (info.accepted) revert SMAAlreadyAccepted();
        if (msg.sender != info.curator) revert NotCurator();
        info.accepted = true;
        otcCustody.addressToCustody(info.custodyId, info.token, info.amount);
    }

    function askWithdraw(uint256 _smaId, uint256 share) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.curator) revert NotCurator();
        if (share == 0) revert InvalidAmount();
        emit AskWithdraw(_smaId, share);
    }

    function fillWithdraw(uint256 _smaId, uint256 amount, OTCCustody.VerificationData memory v) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.curator) revert NotCurator();
        if (amount == 0) revert InvalidAmount();
        v.id = info.custodyId;
        otcCustody.addressToCustody(info.custodyId, info.token, amount);
        _withdrawAmount(_smaId, amount);
    }

    function forceWithdrawUpdateState(uint256 _smaId, OTCCustody.VerificationData memory v) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.owner) revert NotOwner();
        forceWithdrawCurator[_smaId] = msg.sender;
        v.id = info.custodyId;
        otcCustody.updateCustodyState(2, v);
    }

    function forceWithdrawUpdateCustodyToConnector(
        uint256 _smaId,
        address token,
        address connectorAddress,
        uint256 amount,
        OTCCustody.VerificationData memory v
    ) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.owner) revert NotOwner();
        v.id = info.custodyId;
        otcCustody.custodyToConnector(token, connectorAddress, amount, v);
    }

    function forceWithdrawCallConnector(
        uint256 _smaId,
        string calldata connectorType,
        address connectorAddress,
        bytes calldata fixedCallData,
        bytes calldata tailCallData,
        OTCCustody.VerificationData memory v
    ) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.owner) revert NotOwner();
        v.id = info.custodyId;
        otcCustody.callConnector(connectorType, connectorAddress, fixedCallData, tailCallData, v);
    }

    function forceWithdrawCTA(
        uint256 _smaId,
        uint256 amount,
        OTCCustody.VerificationData memory v
    ) external {
        SMAInfo storage info = sma[_smaId];
        if (!info.accepted) revert SMANotAccepted();
        if (msg.sender != info.owner) revert NotOwner();
        v.id = info.custodyId;
        otcCustody.custodyToAddress(info.token, address(this), amount, v);
        _withdrawAmount(_smaId, amount);
    }

    function _withdrawAmount(uint256 _smaId, uint256 amount) internal {
        SMAInfo storage info = sma[_smaId];

        uint256 managementFee = amount * (block.timestamp - info.startTimestamp) / 365 days * info.managementFee / 1e18 / 1e18;

        if (info.amount >= amount) {
            info.amount -= amount;
            IERC20(info.token).safeTransfer(info.owner, amount - managementFee);
            IERC20(info.token).safeTransfer(info.curator, managementFee);
        } else {
            uint256 performanceFee = (amount - info.amount) * info.performanceFee / 1e18;
            IERC20(info.token).safeTransfer(info.owner, info.amount);
            IERC20(info.token).safeTransfer(info.curator, managementFee + performanceFee);
            info.amount = 0;
        }
    }

    // --- View Functions ---

    function getSMA(uint256 _smaId) external view returns (SMAInfo memory) {
        return sma[_smaId];
    }

    function getWithdrawableAmount(uint256 _smaId) external view returns (uint256) {
        return sma[_smaId].amount;
    }

    function isSMAAccepted(uint256 _smaId) external view returns (bool) {
        return sma[_smaId].accepted;
    }

    function getCurator(uint256 _smaId) external view returns (address) {
        return sma[_smaId].curator;
    }
}



/*
Fund Custody & Risk Management
IndexMaker works with Ceffu for the custody of USDC and assets composited in indexes. 
How Ceffu Ensures Safe Custody of Funds
Ceffu provides institutional-grade crypto asset management solutions, focusing on security and efficient technology. They offer a variety of services such as cold storage, off-exchange settlement, and multi-party computation to secure digital assets. Ceffu is designed to meet the needs of institutions by providing custody, liquidity solutions, and compliance with rigorous security standards.
Advanced technologies like multi-party computation (MPC) and multi-signature wallets are utilized. They manage crypto assets using private key encryption, which is stored securely in hardware devices or cryptographic vaults. Ceffu’s custody solutions are compliant with institutional standards, offering features like custom governance controls and robust security measures for managing and protecting digital assets.


MirrorX
Ceffu's MirrorX is a solution by Ceffu that allows projects to deploy their capital on Binance instantaneously while keeping their assets in Ceffu’s independent custody. This service enables a 1:1 balance delegation from a Ceffu account to a designated Binance sub-account, with assets always remaining in Ceffu’s custody. Trades are settled off-exchange, minimizing counterparty risk. Withdrawals can be made directly from the Binance account, triggering a T+1 settlement. This setup combines deep liquidity with heightened security. Read more.*

Risks
As with any asset, it is important to consider potential risks and understand what actions can be taken to mitigate risk. There are general risk factors and risks associated with Index backing maintenance, mainly incured costs while index replication.
Smart Contract Risk 
Smart contract risk refers to the chance for malicious actors to exploit loopholes in the protocol’s smart contracts. IndexMaker engages reputable security firms to conduct audits on all smart contracts and maintains a robust risk monitoring system. However, as exploiters become more sophisticated, there remains a minimal risk of unexpected exploits. To mitigate this, IndexMaker works with security and blockchain partners to stay abreast of the newest developments in crypto and DeFi security. We also regularly liaise with these partners’ in-house risk monitoring teams. 

Custodial Partner Risk
IndexMaker relies on Ceffu for the custody of USDF underlying funds. There may be custodial partner risk if operations on Ceffu fail — such as lack of accessibility, availability of asset transactions and the failure of operational duties like frequent PnL settlements for open positions. There is also risk if Ceffu falls short of compliance, security or data privacy standards, leading to a temporary or permanent shutdown. Due to the above, Ceffu solutions are ISO 27001 and 27701 certified and SOC 2 Type 1 & 2 compliant. These qualifications mean auditors have analyzed Ceffu’s cybersecurity and privacy controls. Ceffu is also part of the Global Travel Rule (GTR) Alliance to comply with the Travel Rule (officially known as the Financial Action Task Force’s (FATF) Recommendation 16), which is set to become the universal standard in compliance reporting. Aside from these, IndexMaker takes a proactive stance to react quickly in the event of custodial partner risk. 

Exchange Partner Risk
The IndexMaker-Ceffu account maintains delta-neutral positions to generate asUSDF yields. USDT assets continue to be kept in Ceffu’s independent custody and trades are settled off-exchange. There is exchange partner risk if the Binance exchange becomes insolvent, which will render the delta-neutral positions ineffective. IndexMaker takes a proactive stance in monitoring to react quickly in the event of exchange partner risk. 
*/


