export interface VaultDocument {
    id: string
    name: string
    url: string
    description?: string
  }
  
  export interface Vault {
    id: string
    name: string
    description: string
    icon: string
    token: {
      symbol: string
      icon: string
      address?: string
    }
    curator: {
      name: string
      icon: string
      url?: string
    }
    totalSupply: {
      amount: string
      usdValue: string
    }
    instantApy: string
    performanceFee: string
    vaultAddress: string
    guardianAddress: string
    liquidity: {
      amount: string
      usdValue: string
    }
    documents: VaultDocument[]
  }
  
  