import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { DbService } from '../../db/db.service';
import { rebalances } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class EtfPriceService {
  constructor(
    private indexRegistryService: IndexRegistryService,
    private coinGeckoService: CoinGeckoService,
    private dbService: DbService,
  ) {}

  async computeLivePrice(indexId: string, chainId: number): Promise<number> {
    const { tokens, weights } = await this.indexRegistryService.getIndexData(indexId, chainId);
    let totalPrice = 0;
    for (let i = 0; i < tokens.length; i++) {
      const coinId = this.mapTokenToCoinGeckoId(tokens[i]); // Map ERC20 address to CoinGecko ID
      const price = await this.coinGeckoService.getLivePrice(coinId);
      totalPrice += price * (weights[i] / 10000); // Weights in basis points
    }
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
}