import type { Vault } from "./types/vault";

export type VaultInfo = {
  id: string;
  name: string;
  icon: string;
  token: string;
  tokenIcon: string;
  totalSupply: string;
  totalSupplyUsd: string;
  instantApy: string;
  vaultApy: string;
  curator: string;
  curatorIcon: string;
  collateral: string[]; // Array of strings (icons)
  rewards: string;
  performanceFee: string;
};

export const vaults: VaultInfo[] = [
  {
    id: "spark-dai",
    name: "Spark DAI Vault",
    icon: "🟠",
    token: "DAI",
    tokenIcon: "🟠",
    totalSupply: "550,536,111.22 DAI",
    totalSupplyUsd: "$550.57M",
    instantApy: "5.38%",
    vaultApy: "5.38%",
    curator: "SparkDAO",
    curatorIcon: "⚡️",
    collateral: ["🔵", "🟣", "🟠"],
    rewards: "+1.16%",
    performanceFee: "0%",
  },
  {
    id: "mev-usdc",
    name: "MEV Capital Usual USDC",
    icon: "🔵",
    token: "USDC",
    tokenIcon: "🔵",
    totalSupply: "322,956,538.41 USDC",
    totalSupplyUsd: "$322.87M",
    instantApy: "6.41%",
    vaultApy: "5.25%",
    curator: "MEV Capital",
    curatorIcon: "⚡️",
    collateral: ["🟢", "🔴", "🔵", "+13"],
    rewards: "+1.16%",
    performanceFee: "10%",
  },
  {
    id: "3",
    name: "Steakhouse USDC",
    icon: "🔵",
    token: "USDC",
    tokenIcon: "🔵",
    totalSupply: "113,948,063.12 USDC",
    totalSupplyUsd: "$113.94M",
    instantApy: "6.78%",
    vaultApy: "5.36%",
    curator: "Steakhouse Financial",
    curatorIcon: "🥩",
    collateral: ["🟡", "🔵", "🟢", "+7"],
    rewards: "+1.16%",
    performanceFee: "5%",
  },
  {
    id: "4",
    name: "Smokehouse USDC",
    icon: "🔵",
    token: "USDC",
    tokenIcon: "🔵",
    totalSupply: "104,908,784.12 USDC",
    totalSupplyUsd: "$104.87M",
    instantApy: "5.76%",
    vaultApy: "4.60%",
    curator: "Steakhouse Financial",
    curatorIcon: "🥩",
    collateral: ["🟡", "🔵", "🟢"],
    rewards: "+1.16%",
    performanceFee: "5%",
  },
  {
    id: "5",
    name: "Steakhouse RUSD",
    icon: "🟠",
    token: "rUSD",
    tokenIcon: "🟠",
    totalSupply: "89,888,265.90 rUSD",
    totalSupplyUsd: "$89.86M",
    instantApy: "7.19%",
    vaultApy: "6.03%",
    curator: "Steakhouse Financial",
    curatorIcon: "🥩",
    collateral: ["🟡", "🔵", "🟢"],
    rewards: "+1.16%",
    performanceFee: "5%",
  },
  {
    id: "6",
    name: "Gauntlet USDC Core",
    icon: "🔵",
    token: "USDC",
    tokenIcon: "🔵",
    totalSupply: "83,017,026.08 USDC",
    totalSupplyUsd: "$82.96M",
    instantApy: "5.69%",
    vaultApy: "5.12%",
    curator: "Gauntlet",
    curatorIcon: "🛡️",
    collateral: ["🟡", "🔵", "🟢", "+9"],
    rewards: "+1.16%",
    performanceFee: "10%",
  },
  {
    id: "7",
    name: "Hakutora USDC",
    icon: "🔵",
    token: "USDC",
    tokenIcon: "🔵",
    totalSupply: "52,719,107.98 USDC",
    totalSupplyUsd: "$52.71M",
    instantApy: "5.34%",
    vaultApy: "4.27%",
    curator: "Hakutora",
    curatorIcon: "🐯",
    collateral: ["🟢", "🔵", "🟣"],
    rewards: "+1.16%",
    performanceFee: "0%",
  },
  {
    id: "8",
    name: "Gauntlet WETH Prime",
    icon: "🟣",
    token: "WETH",
    tokenIcon: "🟣",
    totalSupply: "29,157.98 WETH",
    totalSupplyUsd: "$83.82M",
    instantApy: "3.76%",
    vaultApy: "2.89%",
    curator: "Gauntlet",
    curatorIcon: "🛡️",
    collateral: ["🟡", "🔵", "🟢", "+9"],
    rewards: "+1.16%",
    performanceFee: "10%",
  },
  {
    id: "9",
    name: "Steakhouse USDT",
    icon: "🟢",
    token: "USDT",
    tokenIcon: "🟢",
    totalSupply: "52,453,172.01 USDT",
    totalSupplyUsd: "$52.45M",
    instantApy: "4.74%",
    vaultApy: "3.36%",
    curator: "Steakhouse Financial",
    curatorIcon: "🥩",
    collateral: ["🟡", "🔵"],
    rewards: "+1.16%",
    performanceFee: "5%",
  },
  {
    id: "10",
    name: "Gauntlet LBTC Core",
    icon: "🟡",
    token: "LBTC",
    tokenIcon: "🟡",
    totalSupply: "589.45 LBTC",
    totalSupplyUsd: "$32.80M",
    instantApy: "3.58%",
    vaultApy: "1.92%",
    curator: "Gauntlet",
    curatorIcon: "🛡️",
    collateral: ["🟡", "🔵", "🟢"],
    rewards: "+1.16%",
    performanceFee: "10%",
  },
];

export const mockup_vaults: Vault[] = [
  {
    id: "spark-dai",
    name: "Spark DAI Vault",
    description:
      "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to Morpho markets.",
    icon: "https://cdn.morpho.org/assets/logos/dai.svg",
    token: {
      symbol: "DAI",
      icon: "https://cdn.morpho.org/assets/logos/dai.svg",
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    curator: {
      name: "SparkDAO",
      icon: "https://cdn.morpho.org/v2/assets/images/spark.svg",
      url: "https://spark.fi",
    },
    totalSupply: {
      amount: "525.00M DAI",
      usdValue: "$526.24M",
    },
    instantApy: "5.25%",
    performanceFee: "0%",
    vaultAddress: "0x73e6...ed9D",
    guardianAddress: "0x0000...0000",
    liquidity: {
      amount: "163.35M DAI",
      usdValue: "$163.74M",
    },
    documents: [
      {
        id: "whitepaper",
        name: "Technical details about the Spark DAI vaultTechnical details about the Spark DAI vaultTechnical details about the Spark DAI vaultTechnical details about the Spark DAI vaultTechnical details about the Spark DAI vaultTechnical details about the Spark DAI vault",
        url: "#",
        description: "Technical details about the Spark DAI vault",
      },
      {
        id: "audit",
        name: "Security Audit",
        url: "#",
        description: "Security audit report by ChainSecurity",
      },
    ],
  },
  {
    id: "mev-usdc",
    name: "MEV Capital Usual USDC",
    description:
      "MEV Capital's USDC vault optimizes yield through strategic market positioning and MEV capture techniques.",
    icon: "https://cdn.morpho.org/v2/assets/images/usual.svg",
    token: {
      symbol: "USDC",
      icon: "https://cdn.morpho.org/assets/logos/usdc.svg",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    curator: {
      name: "MEV Capital",
      icon: "https://cdn.morpho.org/v2/assets/images/mevcapital.png",
      url: "https://mev.capital",
    },
    totalSupply: {
      amount: "244.19M USDC",
      usdValue: "$244.13M",
    },
    instantApy: "8.45%",
    performanceFee: "2%",
    vaultAddress: "0x8a43...b721",
    guardianAddress: "0x9f72...e451",
    liquidity: {
      amount: "198.35M USDC",
      usdValue: "$198.31M",
    },
    documents: [
      {
        id: "whitepaper",
        name: "Whitepaper",
        url: "#",
        description: "Technical details about the MEV Capital USDC vault",
      },
    ],
  },
];

export function getVaultById(id: string): Vault | undefined {
  return mockup_vaults.find((vault) => vault.id === id);
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const projects: Project[] = [
  {
    id: "aragon",
    name: "Aragon",
    description:
      "Building full-stack DAO technology, enabling organizations to govern their protocols and assets on-chain.",
    icon: "aragon",
  },
  {
    id: "brahma-console",
    name: "Brahma Console",
    description:
      "Console is your universal multi-chain account to secure, navigate, and automate on-chain interactions.",
    icon: "brahma",
  },
  {
    id: "contango",
    name: "Contango",
    description:
      "Trade decentralized perpetual futures by automated hedging strategies on underlying lending protocols.",
    icon: "contango",
  },
  {
    id: "delv-fixed-borrow",
    name: "DELV Fixed Borrow",
    description:
      "DELV Fixed Borrow enables existing DeFi borrowers on Morpho to fix their interest rates and gain predictability on borrow costs.",
    icon: "hyperdrive",
  },
  {
    id: "defi-saver",
    name: "Defi Saver",
    description:
      "Advanced DeFi Management. All the essential tools for creating, tracking, and managing your DeFi portfolio.",
    icon: "defisaver",
  },
  {
    id: "definitive",
    name: "Definitive",
    description:
      "A non-custodial platform for advanced on-chain trade execution and DeFi yield.",
    icon: "definitive",
  },
  {
    id: "furucombo",
    name: "Furucombo",
    description:
      "Furucombo is a multi-chain DeFi aggregator designed to simplify & optimize DeFi trading for everyone!",
    icon: "furucombo",
  },
  {
    id: "hyperdrive",
    name: "Hyperdrive",
    description:
      "Get yield, your way. Access fixed and variable yields at your control with Hyperdrive.",
    icon: "hyperdrive",
  },
  {
    id: "idle-finance",
    name: "Idle Finance",
    description:
      "Yield optimization and risk tranching. Automated, diversified, DeFi yields.",
    icon: "idlefinance",
  },
  {
    id: "instadapp",
    name: "Instadapp",
    description:
      "The ultimate DeFi hub. Simplify your journey and enjoy a safer, more accessible experience.",
    icon: "instadapp",
  },
  {
    id: "ionic-protocol",
    name: "Ionic Protocol",
    description:
      "Isolated Lending and Borrowing for Yield Bearing Assets on the Superchain.",
    icon: "ionic",
  },
  {
    id: "moonwell",
    name: "Moonwell",
    description:
      "Put your digital assets to work. Lend or borrow to handle whatever life throws your way.",
    icon: "moonwell",
  },
  {
    id: "opencover",
    name: "OpenCover",
    description:
      "The leading cover aggregator to protect your portfolio against protocol risk.",
    icon: "opencover",
  },
  {
    id: "origami",
    name: "Origami",
    description: "Automated leverage for dummies.",
    icon: "origami",
  },
  {
    id: "oval",
    name: "Oval",
    description: "Capture OEV from liquidations.",
    icon: "oval",
  },
  {
    id: "protocolink",
    name: "Protocolink",
    description: "Linking the potential of Web3 using the most elastic SDK.",
    icon: "protocolink",
  },
  {
    id: "reserve",
    name: "Reserve",
    description:
      "A permissionless platform to launch and govern R1 asset-backed currencies.",
    icon: "reserve",
  },
  {
    id: "safe",
    name: "Safe",
    description: "The most trusted Smart Wallet.",
    icon: "safe",
  },
  {
    id: "sommelier-finance",
    name: "Sommelier Finance",
    description:
      "Automated vaults to find best-in-class yields while mitigating risk.",
    icon: "sommelier",
  },
  {
    id: "stream",
    name: "Stream",
    description: "A capital-efficient platform to supercharge DeFi adoption.",
    icon: "stream",
  },
  {
    id: "summerfi",
    name: "SummerFi",
    description:
      "Power up your portfolio by Borrowing, Lending, and Multiplying your favorite assets using automated tools.",
    icon: "summerfi",
  },
  {
    id: "superform",
    name: "Superform",
    description: "The Onchain Wealth App",
    icon: "superform",
  },
  {
    id: "vaultcraft",
    name: "VaultCraft",
    description:
      "Leading modular DeFi and RTCI vault protocol - now powered by Gnosis Safe.",
    icon: "vaultcraft",
  },
];

export interface VaultAllocation {
  id: string;
  percentage: string;
  vaultSupply: {
    amount: string;
    usdValue: string;
  };
  collateral: {
    name: string;
    icon?: string; // For the colored circle icons
  };
  liquidationLTV: string;
  netAPY: string;
  oracle?: string;
  supplyCap?: string;
  capPercentage?: string;
  supplyAPY?: string;
  rewards?: string;
  totalCollateral?: string;
  utilization?: string;
  rateAtUTarget?: string;
  marketId?: string;
}

export const vaultAllocations: VaultAllocation[] = [
  {
    id: "1",
    percentage: "46.12%",
    vaultSupply: {
      amount: "242,198,468.99 DAI",
      usdValue: "$242.1M",
    },
    collateral: {
      name: "PT-sUSDe-27MAR2025",
      icon: "green",
    },
    liquidationLTV: "91.5%",
    netAPY: "5.11%",
    oracle: "Chainlink",
    supplyCap: "500,000,000 DAI",
    capPercentage: "48.4%",
    supplyAPY: "5.25%",
    rewards: "None",
    totalCollateral: "264,698,874 PT-sUSDe",
    utilization: "91.5%",
    rateAtUTarget: "5.2%",
    marketId: "0x7a3e...e45d",
  },
  {
    id: "2",
    percentage: "22.48%",
    vaultSupply: {
      amount: "118,064,884.77 DAI",
      usdValue: "$118.01M",
    },
    collateral: {
      name: "PT-sUSDe-29MAY2025",
      icon: "green",
    },
    liquidationLTV: "91.5%",
    netAPY: "5.67%",
    oracle: "Chainlink",
    supplyCap: "200,000,000 DAI",
    capPercentage: "59.0%",
    supplyAPY: "5.80%",
    rewards: "None",
    totalCollateral: "129,032,660 PT-sUSDe",
    utilization: "91.5%",
    rateAtUTarget: "5.7%",
    marketId: "0x8b2c...f32a",
  },
  {
    id: "3",
    percentage: "9.52%",
    vaultSupply: {
      amount: "50,000,376.01 DAI",
      usdValue: "$49.98M",
    },
    collateral: {
      name: "PT-sUSDe-29MAY2025",
      icon: "yellow",
    },
    liquidationLTV: "91.5%",
    netAPY: "0.74%",
    oracle: "Chainlink",
    supplyCap: "100,000,000 DAI",
    capPercentage: "50.0%",
    supplyAPY: "0.85%",
    rewards: "None",
    totalCollateral: "54,644,127 PT-sUSDe",
    utilization: "91.5%",
    rateAtUTarget: "0.8%",
    marketId: "0x9c3d...a21b",
  },
  {
    id: "4",
    percentage: "7.38%",
    vaultSupply: {
      amount: "38,783,433.16 DAI",
      usdValue: "$38.78M",
    },
    collateral: {
      name: "PT-USDe-27MAR2025",
      icon: "yellow",
    },
    liquidationLTV: "91.5%",
    netAPY: "4.88%",
    oracle: "Chainlink",
    supplyCap: "100,000,000 DAI",
    capPercentage: "38.8%",
    supplyAPY: "5.00%",
    rewards: "None",
    totalCollateral: "42,386,266 PT-USDe",
    utilization: "91.5%",
    rateAtUTarget: "4.9%",
    marketId: "0x6d4e...b78c",
  },
  {
    id: "5",
    percentage: "4.94%",
    vaultSupply: {
      amount: "25,966,814.51 DAI",
      usdValue: "$25.95M",
    },
    collateral: {
      name: "0x000...00",
      icon: "gray",
    },
    liquidationLTV: "0%",
    netAPY: "0.00%",
    oracle: "None",
    supplyCap: "50,000,000 DAI",
    capPercentage: "51.9%",
    supplyAPY: "0.00%",
    rewards: "None",
    totalCollateral: "0",
    utilization: "0%",
    rateAtUTarget: "0.0%",
    marketId: "0x000...000",
  },
  {
    id: "6",
    percentage: "2.91%",
    vaultSupply: {
      amount: "15,306,285.73 DAI",
      usdValue: "$15.3M",
    },
    collateral: {
      name: "USDe",
      icon: "gray",
    },
    liquidationLTV: "86%",
    netAPY: "7.52%",
    oracle: "Chainlink",
    supplyCap: "30,000,000 DAI",
    capPercentage: "51.0%",
    supplyAPY: "7.65%",
    rewards: "None",
    totalCollateral: "17,798,007 USDe",
    utilization: "86%",
    rateAtUTarget: "7.5%",
    marketId: "0x3f2a...c45e",
  },
  {
    id: "7",
    percentage: "2.58%",
    vaultSupply: {
      amount: "13,575,735.31 DAI",
      usdValue: "$13.57M",
    },
    collateral: {
      name: "sUSDe",
      icon: "green",
    },
    liquidationLTV: "86%",
    netAPY: "4.72%",
    oracle: "Chainlink",
    supplyCap: "30,000,000 DAI",
    capPercentage: "45.3%",
    supplyAPY: "4.85%",
    rewards: "None",
    totalCollateral: "15,786,901 sUSDe",
    utilization: "86%",
    rateAtUTarget: "4.8%",
    marketId: "0x2e7b...a93d",
  },
  {
    id: "8",
    percentage: "1.9%",
    vaultSupply: {
      amount: "10,000,000.00 DAI",
      usdValue: "$9.99M",
    },
    collateral: {
      name: "PT-USDe-31JUL2025",
      icon: "yellow",
    },
    liquidationLTV: "91.5%",
    netAPY: "0.00%",
    oracle: "Chainlink",
    supplyCap: "20,000,000 DAI",
    capPercentage: "50.0%",
    supplyAPY: "0.00%",
    rewards: "None",
    totalCollateral: "10,928,962 PT-USDe",
    utilization: "91.5%",
    rateAtUTarget: "0.0%",
    marketId: "0x4a1c...e72f",
  },
  {
    id: "9",
    percentage: "1.87%",
    vaultSupply: {
      amount: "9,827,894.31 DAI",
      usdValue: "$9.82M",
    },
    collateral: {
      name: "sUSDe",
      icon: "green",
    },
    liquidationLTV: "91.5%",
    netAPY: "5.48%",
    oracle: "Chainlink",
    supplyCap: "20,000,000 DAI",
    capPercentage: "49.1%",
    supplyAPY: "5.60%",
    rewards: "None",
    totalCollateral: "10,740,868 sUSDe",
    utilization: "91.5%",
    rateAtUTarget: "5.5%",
    marketId: "0x5b3a...f12d",
  },
  {
    id: "10",
    percentage: "0.22%",
    vaultSupply: {
      amount: "1,188,638.93 DAI",
      usdValue: "$1.18M",
    },
    collateral: {
      name: "USDe",
      icon: "gray",
    },
    liquidationLTV: "91.5%",
    netAPY: "4.88%",
    oracle: "Chainlink",
    supplyCap: "10,000,000 DAI",
    capPercentage: "11.9%",
    supplyAPY: "5.00%",
    rewards: "None",
    totalCollateral: "1,298,512 USDe",
    utilization: "91.5%",
    rateAtUTarget: "4.9%",
    marketId: "0x7c2d...a45e",
  },
  {
    id: "11",
    percentage: "0.01%",
    vaultSupply: {
      amount: "83,076.39 DAI",
      usdValue: "$83.05K",
    },
    collateral: {
      name: "USDe",
      icon: "gray",
    },
    liquidationLTV: "77%",
    netAPY: "7.96%",
    oracle: "Chainlink",
    supplyCap: "1,000,000 DAI",
    capPercentage: "8.3%",
    supplyAPY: "8.10%",
    rewards: "None",
    totalCollateral: "107,891 USDe",
    utilization: "77%",
    rateAtUTarget: "8.0%",
    marketId: "0x8e1f...b23a",
  },
];

export type ReAllocation = {
  id: string;
  timestamp: string;
  user: string;
  nash: string;
  amount: number;
  currency: string;
  type: "Withdraw" | "Supply";
  market: string;
  letv?: number;
};

export const reallocations: ReAllocation[] = [
  {
    id: "tx-1",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 7072894.47,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ IT+USDE-29MAY2025 / DM",
    letv: 91.5,
  },
  {
    id: "tx-2",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 10060000.0,
    currency: "DM",
    type: "Supply",
    market: "🌬️ IT+USDe-31UA2025 / DM",
    letv: 91.5,
  },
  {
    id: "tx-3",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 293085.97,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ USDe / DM",
    letv: 89.85,
  },
  {
    id: "tx-4",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 37970287.26,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ IT+USDe-27MA20225 / DM",
    letv: 91.5,
  },
  {
    id: "tx-5",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 1008372.67,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ USDe / DM",
    letv: 91.5,
  },
  {
    id: "tx-6",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 50000000.0,
    currency: "DM",
    type: "Supply",
    market: "🌬️ IT+USDE-28MAY2025 / DM",
    letv: 91.5,
  },
  {
    id: "tx-7",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 24752838.05,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ UGLI / DM",
    letv: 90,
  },
  {
    id: "tx-8",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 475978.81,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ USDe / DM",
    letv: 91.5,
  },
  {
    id: "tx-9",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 40975054.48,
    currency: "DM",
    type: "Withdraw",
    market: "🌬️ IT+USDE-27MA20225 / DM",
    letv: 91.5,
  },
  {
    id: "tx-10",
    timestamp: "2 days ago",
    user: "0x298b...dFb5",
    nash: "0xfb33...31ca",
    amount: 51077925.31,
    currency: "DM",
    type: "Supply",
    market: "🌬️ UGLI / DM",
    letv: 90,
  },
];

export type SupplyPosition = {
  id: string;
  user: string;
  supply: string;
  supplySummary: string;
  currency: string;
  share: number;
};

export const supplyPositions: SupplyPosition[] = [
  {
    id: "1",
    user: "0x298b...dFb5",
    supply: "525,078,765.05",
    supplySummary: "$524.98M",
    currency: "DAI",
    share: 100,
  },
];

export type Activity = {
  id: string;
  dateTime: string;
  wallet: string;
  hash: string;
  transactionType: string;
  amount: {
    amount: number;
    currency: string;
    amountSummary: string;
  };
};
export const transactionTypes = [
  {
    id: "all",
    name: "All transaction types",
  },
  {
    id: "deposit",
    name: "Vault Deposit",
  },
  {
    id: "withdraw",
    name: "Vault Withdraw",
  },
  {
    id: "free",
    name: "Vault Free",
  },
  {
    id: "transfer",
    name: "Vault Transfer",
  },
];
export const userActivities: Activity[] = [
  {
    id: "1",
    dateTime: "2 days ago",
    wallet: "0×9C25...7f7E",
    hash: "0xfb33...31ca",
    transactionType: "withdraw",
    amount: {
      amount: 25610817.8,
      currency: "DAI",
      amountSummary: "$25.64M",
    },
  },
  {
    id: "2",
    dateTime: "last week",
    wallet: "0×9C25...7f7E",
    hash: "0×9dfe...6b72",
    transactionType: "free",
    amount: {
      amount: 524503.44,
      currency: "DAI",
      amountSummary: "$524.88k",
    },
  },
  {
    id: "3",
    dateTime: "2 weeks ago",
    wallet: "0×9C25...7f7E",
    hash: "0×8633...a84c",
    transactionType: "withdraw",
    amount: {
      amount: 50862402.68,
      currency: "DAI",
      amountSummary: "$50.79M",
    },
  },
  {
    id: "4",
    dateTime: "3 weeks ago",
    wallet: "0×9C25...7f7E",
    hash: "0×97ef...db97",
    transactionType: "transfer",
    amount: {
      amount: 25961392.19,
      currency: "DAI",
      amountSummary: "$25.95M",
    },
  },
  {
    id: "5",
    dateTime: "4 weeks ago",
    wallet: "0×9C25...7f7E",
    hash: "0xaed0...e95d",
    transactionType: "deposit",
    amount: {
      amount: 24802065.11,
      currency: "DAI",
      amountSummary: "$24.8M",
    },
  },
  {
    id: "6",
    dateTime: "4 weeks ago",
    wallet: "0×9C25...7f7E",
    hash: "0×9ac3...a50f",
    transactionType: "free",
    amount: {
      amount: 1224726.63,
      currency: "DAI",
      amountSummary: "$1.22M",
    },
  },
  {
    id: "7",
    dateTime: "last month",
    wallet: "0×9C25...7f7E",
    hash: "0×7817...a01d",
    transactionType: "withdraw",
    amount: {
      amount: 1620592.95,
      currency: "DAI",
      amountSummary: "$1.61M",
    },
  },
  {
    id: "8",
    dateTime: "last month",
    wallet: "0×9C25...7f7E",
    hash: "0xe7d2...f87a",
    transactionType: "deposit",
    amount: {
      amount: 49783280.0,
      currency: "DAI",
      amountSummary: "$49.77M",
    },
  },
  {
    id: "9",
    dateTime: "last month",
    wallet: "0×9C25...7f7E",
    hash: "0xb783...4b58",
    transactionType: "withdraw",
    amount: {
      amount: 1549300.1,
      currency: "DAI",
      amountSummary: "$1.54M",
    },
  },
  {
    id: "10",
    dateTime: "2 months ago",
    wallet: "0×9C25...7f7E",
    hash: "0×7023...45cd",
    transactionType: "transfer",
    amount: {
      amount: 50527858.48,
      currency: "DAI",
      amountSummary: "$50.52M",
    },
  },
];
