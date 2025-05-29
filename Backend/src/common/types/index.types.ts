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
  ticker: string;
  curator: string;
  totalSupply: number;
  ytdReturn: number;
  collateral: { name: string; logo: string }[]; // URLs to token logos
  managementFee: number;
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
