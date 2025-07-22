export interface IndexData {
  tokens: string[];
  weights: number[];
}

export interface RebalanceData {
  indexId: string;
  weights: number[];
  prices: Record<string, number>;
  timestamp: number;
}

export interface IndexListEntry {
  indexId: number;
  name: string;
  address: string;
  ticker: string;
  curator: string;
  totalSupply: number;
  totalSupplyUSD: number;
  ytdReturn: number;
  collateral: { name: string; logo: string }[]; // URLs to token logos
  managementFee: number;
  assetClass?: string;
  inceptionDate?: string;
  category?: string;
  ratings?: {
    overallRating: string;
    expenseRating: string;
    riskRating: string;
  };
  performance?: {
    ytdReturn: number;
    oneYearReturn: number;
    threeYearReturn: number;
    fiveYearReturn: number;
    tenYearReturn: number;
  };
}
export interface VaultAsset {
  id: number;
  ticker: string;
  listing: string;
  assetname: string;
  sector: string;
  market_cap: number;
  weights: string;
}

export interface FundRating {
  overallRating: string; // e.g., "A+", "B-", "C+"
  expenseRating: string;
  riskRating: string;
}

export interface FundPerformance {
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  tenYearReturn: number;
}