import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { DbService } from '../../db/db.service';
import { rebalances } from '../../db/schema';
import { eq } from 'drizzle-orm';
import {ethers} from 'ethers';
import * as path from 'path';

@Injectable()
export class EtfPriceService {
  private provider: ethers.JsonRpcProvider;
  private indexRegistry: ethers.Contract;
  private readonly signer: ethers.Wallet;

  constructor(
    private indexRegistryService: IndexRegistryService,
    private coinGeckoService: CoinGeckoService,
    private dbService: DbService,
  ) {
    const rpcUrl =
      process.env.BASE_RPCURL || 'https://mainnet.base.org'; // Use testnet URL for Sepolia if needed
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Configure signer with private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not set in .env');
    }
    this.signer = new ethers.Wallet(privateKey, this.provider);
    const artifactPath = path.resolve(
      __dirname,
      '../../../../artifacts/contracts/src/ETFMaker/IndexRegistry.sol/IndexRegistry.json',
    );
    const IndexRegistryArtifact = require(artifactPath);
    this.indexRegistry = new ethers.Contract(
      process.env.INDEX_REGISTRY_ADDRESS || '',
      IndexRegistryArtifact.abi,
      this.provider
    );
  }

  async computeLivePrice(indexId: string, chainId: number): Promise<number> {
    // const { tokens, weights } = await this.indexRegistryService.getIndexData(indexId, chainId);
    let totalPrice = 0;
    // for (let i = 0; i < tokens.length; i++) {
    //   const coinId = this.mapTokenToCoinGeckoId(tokens[i]); // Map ERC20 address to CoinGecko ID
    //   const price = await this.coinGeckoService.getLivePrice(coinId);
    //   totalPrice += price * (weights[i] / 10000); // Weights in basis points
    // }
    return totalPrice;
  }

  async computeHistoricalPrice(indexId: string, timestamp: number): Promise<number> {
    const rebalance = await this.dbService
      .getDb()
      .select()
      .from(rebalances)
      .where(eq(rebalances.indexId, indexId))
      .where(eq(rebalances.timestamp, timestamp))
      .limit(1);
    if (!rebalance[0]) return 0;
    const prices = rebalance[0].prices as Record<string, number>;
    const weights = JSON.parse(rebalance[0].weights) as number[];
    let totalPrice = 0;
    Object.keys(prices).forEach((token, i) => {
      totalPrice += prices[token] * (weights[i] / 10000);
    });
    return totalPrice;
  }

  private mapTokenToCoinGeckoId(token: string): string {
    // Mock mapping (replace with actual mapping)
    const map: Record<string, string> = {
      '0x...': 'bitcoin',
      '0x1..': 'ethereum',
    };
    return map[token.toLowerCase()] || 'unknown';
  }

  async getHistoricalData(indexId: number) {
    // Get all timestamps with updates
    const filter = this.indexRegistry.filters.CuratorWeightsSet(indexId);
    const events = await this.indexRegistry.queryFilter(filter);
    const indexData = await this.indexRegistry.getIndexDatas(indexId.toString());
    // Get data for each timestamp
    const historicalData = await Promise.all(
      events.map(async (event: any) => {
        console.log(event)
        const timestamp = Number(event.args.timestamp);
        const price = Number(event.args.price) / 1e6;
        
        // Decode weights (assuming they're encoded as bytes)
        const weightsData = event.args.weights;
        // const weights = this.decodeWeights(weightsData);
        const weights: string = weightsData
        
        return {
          name: indexData[0],
          timestamp,
          date: new Date(timestamp * 1000),
          price,
          weights: this.indexRegistryService.decodeWeights(weights)
        };
      })
    );
    
    // Sort by date
    return historicalData.sort((a, b) => a.timestamp - b.timestamp);
  }
}