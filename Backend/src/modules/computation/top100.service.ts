import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { BinanceService } from '../data-fetcher/binance.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { compositions, rebalances } from '../../db/schema';
import { ethers } from 'ethers';
import { DbService } from 'src/db/db.service';

@Injectable()
export class Top100Service {
  private readonly logger = new Logger(Top100Service.name);
  private readonly fallbackStablecoins = ['usdt', 'usdc', 'dai', 'busd'];
  private readonly fallbackWrappedTokens = ['wbtc', 'weth'];
  private readonly blacklistedCategories = ['Stablecoin', 'Wrapped Token']; // Add more as needed

  constructor(
    private coinGeckoService: CoinGeckoService,
    private binanceService: BinanceService,
    private indexRegistryService: IndexRegistryService,
    private dbService: DbService,
  ) {}

  async rebalanceTop100(indexId: number): Promise<void> {
    try {
      // Fetch market cap (limit to top 200 to cover filtering)
      const marketCaps = await this.coinGeckoService.getMarketCap(200);
      const binanceTokens = new Set(await this.binanceService.getListedTokens());

      // Filter top 100, exclude blacklisted categories
      const eligibleTokens: any[] = [];
      for (const coin of marketCaps) {
        if (eligibleTokens.length >= 100) break;
        if (!binanceTokens.has(coin.symbol.toUpperCase())) continue;

        const categories = await this.coinGeckoService.getCategories(coin.id);
        const isBlacklisted = categories.some((c) => this.blacklistedCategories.includes(c));
        const isAllowedStablecoin = this.fallbackStablecoins.includes(coin.id);
        const isAllowedWrappedToken = this.fallbackWrappedTokens.includes(coin.id);

        if (!isBlacklisted || isAllowedStablecoin || isAllowedWrappedToken) {
          eligibleTokens.push(coin);
        } else {
          this.logger.warn(`Excluded ${coin.id} (categories: ${categories.join(', ')})`);
        }
      }

      if (eligibleTokens.length < 100) {
        this.logger.warn(`Only ${eligibleTokens.length} eligible tokens found for Top 100 index`);
        // Optional: Include fallback stablecoins
        const fallbackTokens = await this.getFallbackTokens();
        for (const coin of fallbackTokens) {
          if (eligibleTokens.length >= 100) break;
          if (!eligibleTokens.some((t) => t.id === coin.id)) {
            eligibleTokens.push(coin);
          }
        }
      }

      // Equal weights (1% each, 100 basis points = 1%)
      const weights = eligibleTokens.map(() => 100);
      const tokenAddresses = eligibleTokens.map((coin) => this.mapCoinGeckoToToken(coin.id));
      const weightsForContract = tokenAddresses.map((addr, i) => [addr, weights[i]] as [string, number]);

      // Compute ETF price
      const prices = await Promise.all(
        eligibleTokens.map((coin) => this.coinGeckoService.getLivePrice(coin.id)),
      );
      const etfPrice = prices.reduce((sum, price, i) => sum + price * (weights[i] / 10000), 0);

      // Store composition
      await this.dbService.getDb().insert(compositions).values(
        tokenAddresses.map((addr, i) => ({
          indexId: indexId.toString(),
          tokenAddress: addr,
          weight: (weights[i] / 100).toString(),
        })),
      );

      // Store rebalance
      await this.dbService.getDb().insert(rebalances).values({
        indexId: indexId.toString(),
        weights: JSON.stringify(weights),
        prices: prices.reduce((obj, p, i) => ({ ...obj, [tokenAddresses[i]]: p }), {}),
        timestamp: Math.floor(Date.now() / 1000),
      });

      // Update smart contract
      await this.indexRegistryService.setCuratorWeights(
        indexId,
        weightsForContract,
        Math.floor(etfPrice * 1e6),
        Math.floor(Date.now() / 1000),
        8453,
      );

      this.logger.log(`Rebalanced Top 100 index with ${eligibleTokens.length} tokens`);
    } catch (error) {
      this.logger.error(`Error rebalancing Top 100 index: ${error.message}`);
      throw error;
    }
  }

  private async getFallbackTokens() {
    const fallbackIds = [...this.fallbackStablecoins, ...this.fallbackWrappedTokens];
    const tokens: any[] = [];
    for (const id of fallbackIds) {
      try {
        const marketData = await this.coinGeckoService.getMarketCap(1, { ids: id });
        if (marketData.length > 0) tokens.push(marketData[0]);
      } catch (error) {
        this.logger.warn(`Failed to fetch fallback token ${id}: ${error.message}`);
      }
    }
    return tokens;
  }

  private mapCoinGeckoToToken(coinId: string): string {
    const map: Record<string, string> = {
      bitcoin: '0x...',
      ethereum: '0x...',
    };
    return map[coinId] || '0x0000000000000000000000000000000000000000';
  }
}