// Define the supported languages
type Language = {
  code: string;
  name: string;
  flag: string;
};
export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
];
export type TranslationKeys = {
  common: Record<string, string>;
  table: Record<string, string>;
  type: Record<string, string>;
  ecosystem: Record<string, string>;
};

type Translations = {
  en: TranslationKeys;
};
// Define the translations
export const translations: Translations = {
  en: {
    common: {
      index: "Our Indexes",
      curators: "Curators",
      analytics: "Analytics",
      delegate: "Delegate",
      fundmakerDocs: "FundMaker Docs",
      fundmakerOptimizers: "FundMaker Optimizers",
      support: "Contact us",
      termsOfUse: "Terms of Use",
      connectWallet: "Connect Wallet",
      disconnect: "Disconnect",
      searchVaults: "Search indexes...",
      searchProperties: "Search for properties...",
      editProperties: "Edit properties",
      myEarn: "My Earn",
      howDoesItWork: "How does it work?",
      depositInVault: "Buy an Index",
      totalDeposits: "Total Managed",
      totalBorrow: "Total Volume",
      projectsOnFundMaker: "Projects building on FundMaker",
      visit: "Visit",
      launchApp: "Launch App",
      overview: "Overview",
      fundmakerIntegration: "FundMaker integration",
      url: "URL",
      marketInsights: "Market Insights",
      responsibleInvesting: "Responsible Investing",

      integrationDocs: "Integration Docs",
      social: "Social",
      docs: "Docs",
      totalFundMaker: "Total FundMaker",
      fundmakerMainnet: "FundMaker - Mainnet",
      fundmakerBase: "FundMaker - Base",
      fundmakerOptimizer: "FundMaker Optimizer",
      tvl: "TVL",
      marketsCreated: "Markets created",
      fundmakerVaults: "FundMaker Indexes",
      averageAPYImprovement: "Average APY Improvement",
      vaultInfo: "Vault Info",
      vaultAllocationBreakdown: "Vault Allocation Breakdown",
      vaultAllocationBreakdownNote:
        "The table below shows a breakdown of the market exposures of the vault. For example, the Supply APY represents the amount of interest earned by the vault for supplying liquidity to the market.",
      vaultReallocations: "Vault Reallocations",
      userActivity: "User Activity",
      supplyPositions: "Supply Positions",
      page: "Page",
      of: "of",
      proceed: "Proceed",
      howEarnWorks: "How Earn Works",
      depositInFundMakerVault: "Deposit in a FundMaker Vault",
      assetsAreSuppliedOnFundMaker: "Assets are supplied on FundMaker",
      earnYieldFromBorrowers: "Earn yield from borrowers",
      earnYieldByDepositingAssetIntoVault:
        "Earn yield by depositing an asset into a vault curated by third-party risk experts. Each vault has a unique risk profile and strategy determined by the curator. Creating FundMaker Indexes is permissionless, so users should assess a vault&apos;s curator and risk exposure before depositing.",
      fundmakerVaultAllocation:
        "A FundMaker Vault can only allocate deposits on FundMaker Markets primary listed by the curator. Depositors are exposed to risks related to the parameters of each market, including the collateral asset, liquidation LTV, and oracles.",
      vaultsGenerateYield:
        "Indexes generate a yield from over-collateralized lending. Borrowers deposit collateral and borrow liquidity from the underlying markets, paying interest to the vault.",
      fundmakerSecurityWithLinks:
        'FundMaker is committed to industry-leading security practices, but there are still risks associated with <a href="https://docs.fundmaker.cc/morpho/concepts/risk-documentation" class="underline">FundMaker</a> and <a href="https://docs.fundmaker.cc/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Check this box to confirm you have read the FundMaker <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Terms of Use</a> and understand the associated risks.',
      claim: "Claim rewards",
      positions: "Positions",
      rewards: "Rewards",
      bundler: "Bundler",
      oneDayEarnAPY: "1D Earn APY",
      collateralExposure: "Collateral Exposure",
      cancel: "Cancel",
      finalizeTransactions: "Finalize Transactions",
      max: "Max",
      balance: "Balance",
      noClaimableRewards:
        "You currently have no claimable or accruing rewards on Ethereum.",
      noEarnPosition: "You currently have no Earn position on Ethereum.",
      switchWallet: "Switch Wallet",
      disconnectWallet: "Disconnect Wallet",
      switchWalletNetwork: "Switch wallet network",
      transactionConfrimTitle:
        "Are you sure you want to cancel your transactions?",
      noKeep: "No, keep",
      yesCancel: "Yes, cancel",
      insufficientValue: "You have an insufficient balance.",
      maxSupplyConfirmation: "You will not have ETH left to pay for gas.",
      iUnderstand: "I understand",
      undoMaxSupply: "Undo max supply",
    },
    table: {
      vaultName: "Vault Name",
      token: "Token",
      totalSupply: "Total Supply",
      netAPY: "Net APY",
      instantAPY: "Instant APY",
      supplyAPY: "Vault APY",
      curator: "Curator",
      collateral: "Collateral",
      rewards: "Rewards",
      performanceFee: "Performance Fee",
      utilization: "Utilization",
      vaultAddress: "Vault Address",
      liqudity: "Liquidity",
      guardianAddress: "Guardian Address",
      percentage: "Allocation %",
      dateTime: "Date & Time",
      wallet: "User",
      transactionType: "Transaction Type",
      amount: "Amount",
      vaultSupply: "Index AUM",
      oracle: "Oracle",
      supplyCap: "Supply Cap",
      capPercentage: "Cap %",
      totalCollateral: "Total Collateral",
      rateAtUTarget: "Rate at uTarget",
      marketId: "Market ID",
      market: "Market",
      type: "Type",
      hash: "Hash",
      timestamp: "Timestamp",
      user: "User",
      supply: "Supply",
      share: "Share",
    },
    type: {
      all: "All Transaction Types",
      deposit: "Vault Deposit",
      withdraw: "Vault Withdraw",
      free: "Vault Free",
      transfer: "Vault Transfer",
    },
    ecosystem: {
      aragon:
        "Building full-stack DAO technology, enabling organizations to govern their protocols and assets on-chain.",
      "brahma-console":
        "Console is your universal multi-chain account to secure, navigate, and automate on-chain interactions.",
      contango:
        "Trade decentralized perpetual futures by automated hedging strategies on underlying lending protocols.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow enables existing DeFi borrowers on FundMaker to fix their interest rates and gain predictability on borrow costs.",
      "defi-saver":
        "Advanced DeFi Management. All the essential tools for creating, tracking, and managing your DeFi portfolio.",
      
    },
  },

};

// Get translation for a key
export function getTranslation(language: string, key: string): string {
  const keys = key.split(".");
  let result: unknown = translations[language as keyof Translations];

  for (const k of keys) {
    if (typeof result !== "object" || result === null) return key;
    result = (result as Record<string, unknown>)[k];
  }

  return typeof result === "string" ? result : key;
}
