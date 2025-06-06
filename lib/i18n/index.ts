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
  subscribe: Record<string, string>;
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
      vaultAssets: "Index Assets",
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
      vaultInfo: "Index Info",
      indexInfo: "Index Info",
      indexBalance: "Index Balance",
      indexOverview: "Index Overview",
      indexPerformance: "Index Performance",
      connect: "Let's Connect",
      subscribe: "Subscribe",
      buy: 'Buy Now',
      vaultAllocationBreakdown: "Index Allocation Breakdown",
      vaultAllocationBreakdownNote:
        "The table below shows a breakdown of the market exposures of the index. For example, the Supply APY represents the amount of interest earned by the vault for supplying liquidity to the market.",
      vaultReallocations: "Index Reallocations",
      userActivity: "User Activity",
      supplyPositions: "Supply Positions",
      page: "Page",
      of: "of",
      proceed: "Proceed",
      howEarnWorks: "How Earn Works",
      depositInFundMakerVault: "Deposit in a FundMaker Index",
      assetsAreSuppliedOnFundMaker: "Assets are supplied on FundMaker",
      earnYieldFromBorrowers: "Earn yield from borrowers",
      earnYieldByDepositingAssetIntoVault:
        "Earn yield by depositing an asset into a index curated by third-party risk experts. Each index has a unique risk profile and strategy determined by the curator. Creating FundMaker Indexes is permissionless, so users should assess a index&apos;s curator and risk exposure before depositing.",
      fundmakerVaultAllocation:
        "A FundMaker Index can only allocate deposits on FundMaker Markets primary listed by the curator. Depositors are exposed to risks related to the parameters of each market, including the collateral asset, liquidation LTV, and oracles.",
      vaultsGenerateYield:
        "Indexes generate a yield from over-collateralized lending. Borrowers deposit collateral and borrow liquidity from the underlying markets, paying interest to the index.",
      fundmakerSecurityWithLinks:
        'FundMaker is committed to industry-leading security practices, but there are still risks associated with <a href="https://docs.fundmaker.cc/morpho/concepts/risk-documentation" class="underline">FundMaker</a> and <a href="https://docs.fundmaker.cc/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Index</a>.',
      checkBoxConfirmationWithLink:
        'Check this box to confirm you have read the FundMaker <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Terms of Use</a> and understand the associated risks.',
      claim: "Claim rewards",
      positions: "Positions",
      rewards: "Rewards",
      bundler: "Bundler",
      oneDayEarnAPY: "YTD",
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
      ecosystem: "Ecosystem",
      submit: "Submit",
    },
    table: {
      name: "Index Name",
      token: "Token",
      ticker: "Ticker",
      totalSupply: "Total Supply",
      netAPY: "Net APY",
      supplyAPY: "Index APY",
      ytdReturn: "YTD Return",
      assetname: "Asset Name",
      curator: "Curator",
      collateral: "Collateral",
      rewards: "Rewards",
      managementFee: "Management Fee",
      utilization: "Utilization",
      vaultAddress: "Index Address",
      liquidity: "Liquidity",
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
      market_cap: "Market Cap",
      weights: "Weight",
      sector: "Sector",
    },
    type: {
      all: "All Transaction Types",
      mint: "Index Mint",
      collateral_deposit: "Collateral Deposit",
      index_deposit: "Index Deposit",
      burn: "Index Burn",
      bridge: "Index Bridge",
      redeem: 'Collateral Redeem'
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
    subscribe: {
      description: "Receive direct updates with the latest observations on markets from our senior investment professionals and discover the latest opportunities across equities, bonds and specialized assets.",
      formTitle: "Manage your subscriptions",
      emailLabel: "EMAIL ADDRESS*",
      investorType: "INVESTOR TYPE",
      individualInvestor: "INDIVIDUAL INVESTOR",
      institutionalInvestor : "INSTITUTIONAL INVESTOR",
      learnMore: "Learn more about how we approach each topic and select your subscriptions below.",
      infoText: "Our investment teams share their latest thinking on markets, sectors, and investment strategies through regular publications.",
      marketPerspectives: "Quarterly outlooks and thematic research from our investment teams.",
      etfUpdates: "Performance commentary and portfolio manager insights on our ETF strategies.",
      submitButton: 'Subscribe',
      privacyPolicy: " I have read the Online Privacy Policy",
    }
  }
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
