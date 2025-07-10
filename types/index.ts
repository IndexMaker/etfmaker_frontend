export interface Project {
  id: number;
  projectId: string;
  name: string;
  description: string;
  icon: string;
  websiteUrl?: string;
  docsUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  screenshots?: string[];
  overview?: string;
  integrationDetails?: string;
}

export interface IndexListEntry {
  indexId: number;
  name: string;
  ticker: string;
  curator: string;
  totalSupply: number;
  totalSupplyUSD: number;
  ytdReturn: number;
  collateral: {name: string, logo: string}[]; // URLs to token logos
  managementFee: number;
  assetClass?: string;
  category?: string;
  inceptionDate?: string;
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
