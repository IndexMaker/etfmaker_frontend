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