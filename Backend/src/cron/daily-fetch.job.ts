import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from '../db/db.service';
import { CoinGeckoService } from 'src/modules/data-fetcher/coingecko.service';
import { CoinMarketCapService } from 'src/modules/data-fetcher/coinmarketcap.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';
import { IndexService } from 'src/modules/blockchain/index.service';
import { Top100Service } from 'src/modules/computation/top100.service';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';
import { binanceListings, tokenCategories, tokenOhlc } from 'src/db/schema';

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
    // const cmcMarketCaps = await this.coinMarketCapService.getMarketCap();

    // Fetch Binance listings
    const { listings, delistings } =
      await this.binanceService.detectListingsAndDelistings();

    // Store Binance listings/delistings
    const timestamp = Math.floor(Date.now() / 1000);
    const listingInserts = [
      ...listings.map((pair) => ({
        pair,
        action: 'listing',
        timestamp,
        createdAt: new Date(),
      })),
      ...delistings.map((pair) => ({
        pair,
        action: 'delisting',
        timestamp,
        createdAt: new Date(),
      })),
    ];

    if (listingInserts.length > 0) {
      await this.dbService
        .getDb()
        .insert(binanceListings)
        .values(listingInserts);
      console.log(
        `Stored ${listingInserts.length} Binance listing/delisting events`,
      );
    }

    // Fetch OHLC and categories for top tokens
    const ohlcInserts: any[] = [];
    const categoryInserts: any[] = [];
    for (const coin of cgMarketCaps.slice(0, 100)) {
      try {
        const ohlcData = await this.coinGeckoService.getOHLC(coin.id);
        const categories = await this.coinGeckoService.getCategories(coin.id);

        // Assume ohlcData returns an array of [timestamp, open, high, low, close]
        const latestOhlc = ohlcData[ohlcData.length - 1]; // Get most recent
        if (latestOhlc && latestOhlc.length === 5) {
          ohlcInserts.push({
            coinId: coin.id,
            open: latestOhlc[1].toString(),
            high: latestOhlc[2].toString(),
            low: latestOhlc[3].toString(),
            close: latestOhlc[4].toString(),
            timestamp: Math.floor(latestOhlc[0] / 1000), // Convert ms to s
            createdAt: new Date(),
          });
        }

        categoryInserts.push({
          coinId: coin.id,
          categories,
          updatedAt: new Date(),
        });

        console.log(`Fetched OHLC and categories for ${coin.id}`);
      } catch (error) {
        console.warn(`Failed to fetch data for ${coin.id}: ${error.message}`);
      }
    }

    // Store OHLC and categories
    if (ohlcInserts.length > 0) {
      await this.dbService.getDb().insert(tokenOhlc).values(ohlcInserts);
      console.log(`Stored OHLC for ${ohlcInserts.length} tokens`);
    }
    if (categoryInserts.length > 0) {
      await this.dbService
        .getDb()
        .insert(tokenCategories)
        .values(categoryInserts)
        .onConflictDoUpdate({
          target: tokenCategories.coinId,
          set: {
            categories: categoryInserts[0].categories,
            updatedAt: new Date(),
          },
        });
      console.log(`Stored categories for ${categoryInserts.length} tokens`);
    }
    await this.indexService.listenToEvents(process.env.INDEX_REGISTRY_ADDRESS || '', 8453); // Base
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async rebalanceSYAZ() {
    await this.dbService.getDb().transaction(async (tx) => {
      const top100Service = new Top100Service(
        this.coinGeckoService,
        this.binanceService,
        new IndexRegistryService(),
        new DbService(),
      );
      const timestamp = Math.floor((new Date()).getTime() / 1000)
      await top100Service.rebalanceSYAZ(2, timestamp);
    });
  }

  @Cron('0 0 */14 * *') // Every 2 weeks
  async rebalanceSY100() {
    await this.dbService.getDb().transaction(async (tx) => {
      const top100Service = new Top100Service(
        this.coinGeckoService,
        this.binanceService,
        new IndexRegistryService(),
        new DbService(),
      );
      const timestamp = Math.floor((new Date()).getTime() / 1000)
      await top100Service.rebalanceSY100(1, timestamp);
    });
  }
}
