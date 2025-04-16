import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from '../db/db.service';
import { CoinGeckoService } from 'src/modules/data-fetcher/coingecko.service';
import { CoinMarketCapService } from 'src/modules/data-fetcher/coinmarketcap.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';
import { IndexService } from 'src/modules/blockchain/index.service';
import { Top100Service } from 'src/modules/computation/top100.service';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';

@Injectable()
export class DailyFetchJob {
  constructor(
    private coinGeckoService: CoinGeckoService,
    private coinMarketCapService: CoinMarketCapService,
    private binanceService: BinanceService,
    private dbService: DbService,
    private indexService: IndexService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyFetch() {
    // Fetch market cap
    const cgMarketCaps = await this.coinGeckoService.getMarketCap();
    const cmcMarketCaps = await this.coinMarketCapService.getMarketCap();

    // Fetch Binance listings
    const { listings, delistings } = await this.binanceService.detectListingsAndDelistings();

    // Fetch OHLC and categories for top tokens
    for (const coin of cgMarketCaps.slice(0, 100)) {
      const ohlc = await this.coinGeckoService.getOHLC(coin.id);
      const categories = await this.coinGeckoService.getCategories(coin.id);
      // Store in database (implement storage logic as needed)
    }

    // Start event listeners for indices
    const indexId = 'top100'; // Example
    await this.indexService.listenToEvents('0xYourIndexAddress', 1); // Mainnet
    await this.indexService.listenToEvents('0xYourIndexAddress', 8453); // Base
  }

  @Cron('0 0 */14 * *') // Every 2 weeks
  async handleRebalance() {
    await this.dbService.getDb().transaction(async (tx) => {
      const top100Service = new Top100Service(
        this.coinGeckoService,
        this.binanceService,
        new IndexRegistryService(),
        {
          db: tx,
          getDb: () => tx,
        },
      );
      await top100Service.rebalanceTop100('top100');
    });
  }
}
