import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DbService } from '../db/db.service';
import { CoinGeckoService } from 'src/modules/data-fetcher/coingecko.service';
import { CoinMarketCapService } from 'src/modules/data-fetcher/coinmarketcap.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';
import { IndexService } from 'src/modules/blockchain/index.service';
import { EtfMainService } from 'src/modules/computation/etf-main.service';
import { EtfPriceService } from 'src/modules/computation/etf-price.service';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';
import { binanceListings, tokenCategories, tokenOhlc } from 'src/db/schema';
import { BitgetService } from 'src/modules/data-fetcher/bitget.service';
import { ScraperService } from 'src/modules/scraper/scraperService';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from 'src/modules/pdf/pdf.service';
@Injectable()
export class DailyFetchJob {
  constructor(
    private coinGeckoService: CoinGeckoService,
    private coinMarketCapService: CoinMarketCapService,
    private binanceService: BinanceService,
    private dbService: DbService,
    private indexService: IndexService,
    private bitgetService: BitgetService,
    private etfPriceService: EtfPriceService,
    private scraperService: ScraperService,
    private readonly pdfService: PdfService
  ) {}

  @Cron('10 21 * * *')
  async temp() {
    // await this.etfPriceservice.storeDailyETFPrices([21, 22, 23, 24, 25, 26]);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(21);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(22);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(23);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(24);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(25);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(27);
  }
  @Cron('10 0 * * *')
  async handleDailyFetch() {
    // Fetch market cap
    // const cgMarketCaps = await this.coinGeckoService.getMarketCap();
    // // const cmcMarketCaps = await this.coinMarketCapService.getMarketCap();

    // // Fetch Binance listings
    // const { listings, delistings } =
    //   await this.binanceService.detectListingsAndDelistings();

    // // Store Binance listings/delistings
    // const timestamp = Math.floor(Date.now() / 1000);
    // const listingInserts = [
    //   ...listings.map((pair) => ({
    //     pair,
    //     action: 'listing',
    //     timestamp,
    //     createdAt: new Date(),
    //   })),
    //   ...delistings.map((pair) => ({
    //     pair,
    //     action: 'delisting',
    //     timestamp,
    //     createdAt: new Date(),
    //   })),
    // ];

    // if (listingInserts.length > 0) {
    //   await this.dbService
    //     .getDb()
    //     .insert(binanceListings)
    //     .values(listingInserts);
    //   console.log(
    //     `Stored ${listingInserts.length} Binance listing/delisting events`,
    //   );
    // }

    // // Fetch OHLC and categories for top tokens
    // const ohlcInserts: any[] = [];
    // const categoryInserts: any[] = [];
    // for (const coin of cgMarketCaps.slice(0, 100)) {
    //   try {
    //     const ohlcData = await this.coinGeckoService.getOHLC(coin.id);
    //     const categories = await this.coinGeckoService.getCategories(coin.id);

    //     // Assume ohlcData returns an array of [timestamp, open, high, low, close]
    //     const latestOhlc = ohlcData[ohlcData.length - 1]; // Get most recent
    //     if (latestOhlc && latestOhlc.length === 5) {
    //       ohlcInserts.push({
    //         coinId: coin.id,
    //         open: latestOhlc[1].toString(),
    //         high: latestOhlc[2].toString(),
    //         low: latestOhlc[3].toString(),
    //         close: latestOhlc[4].toString(),
    //         timestamp: Math.floor(latestOhlc[0] / 1000), // Convert ms to s
    //         createdAt: new Date(),
    //       });
    //     }

    //     categoryInserts.push({
    //       coinId: coin.id,
    //       categories,
    //       updatedAt: new Date(),
    //     });

    //     console.log(`Fetched OHLC and categories for ${coin.id}`);
    //   } catch (error) {
    //     console.warn(`Failed to fetch data for ${coin.id}: ${error.message}`);
    //   }
    // }

    // // Store OHLC and categories
    // if (ohlcInserts.length > 0) {
    //   await this.dbService.getDb().insert(tokenOhlc).values(ohlcInserts);
    //   console.log(`Stored OHLC for ${ohlcInserts.length} tokens`);
    // }
    // if (categoryInserts.length > 0) {
    //   await this.dbService
    //     .getDb()
    //     .insert(tokenCategories)
    //     .values(categoryInserts)
    //     .onConflictDoUpdate({
    //       target: tokenCategories.coinId,
    //       set: {
    //         categories: categoryInserts[0].categories,
    //         updatedAt: new Date(),
    //       },
    //     });
    //   console.log(`Stored categories for ${categoryInserts.length} tokens`);
    // }
    // await this.indexService.listenToEvents(process.env.INDEX_REGISTRY_ADDRESS || '', 8453); // Base

    // store daily token's price
    await this.coinGeckoService.storeMissingPricesUntilToday();
    await this.binanceService.storeTradingPairs();
    await this.binanceService.storePairListingTimestamps();
    await this.bitgetService.syncListings();
  }

  @Cron('30 0 * * *') // Triggers daily at 00:30 (but filters dates)
  async rebalanceSY100() {
    // Compute daily price again.
    await this.etfPriceService.getHistoricalDataFromTempRebalances(21);
    await this.etfPriceService.getHistoricalDataFromTempRebalances(22);
    await this.etfPriceService.getHistoricalDataFromTempRebalances(23);
    await this.etfPriceService.getHistoricalDataFromTempRebalances(24);
    await this.etfPriceService.getHistoricalDataFromTempRebalances(25);
    await this.etfPriceService.getHistoricalDataFromTempRebalances(27);
    return;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const firstRunDate = new Date('2024-05-26T00:00:00'); // Starting point: May 26, 2024

    // Calculate days since May 20th
    const daysSinceStart = Math.floor(
      (today.getTime() - firstRunDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only execute if it's a biweekly interval (0, 14, 28... days since May 20th)
    if (daysSinceStart >= 0 && daysSinceStart % 14 === 0) {
      await this.dbService.getDb().transaction(async (tx) => {
        const etfMainService = new EtfMainService(
          this.coinGeckoService,
          this.binanceService,
          this.bitgetService,
          new IndexRegistryService(),
          new DbService(),
        );
        const timestamp = Math.floor(today.getTime() / 1000);
        await etfMainService.rebalanceSY100(timestamp);
      });
    }
  }

  @Cron('40 0 * * *')
  async rebalanceAllETFs() {
    return;
    await this.dbService.getDb().transaction(async (tx) => {
      const etfMainService = new EtfMainService(
        this.coinGeckoService,
        this.binanceService,
        this.bitgetService,
        new IndexRegistryService(),
        new DbService(),
      );
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const timestamp = Math.floor(now.getTime() / 1000);

      // Rebalance all ETFs
      await etfMainService.rebalanceETF(
        'andreessen-horowitz-a16z-portfolio',
        22,
        timestamp,
      ); // SYAZ
      await etfMainService.rebalanceETF('layer-2', 23, timestamp); // SYL2
      await etfMainService.rebalanceETF(
        'artificial-intelligence',
        24,
        timestamp,
      ); // SYAI
      await etfMainService.rebalanceETF('meme-token', 25, timestamp); // SYME
      await etfMainService.rebalanceETF(
        'decentralized-finance-defi',
        27,
        timestamp,
      ); // SYDF
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // console.log('Running hourly scraper task');
    // const bitgetData = await this.scraperService.scrapeBitget();
    // const binanceData = await this.scraperService.scrapeBinance();
    // const allListings = [...bitgetData.listings, ...binanceData.listings];
    // const allAnnouncements = [...bitgetData.announcements, ...binanceData.announcements];
    // const transformedListings = await this.scraperService.transformData(allListings);
    // await this.scraperService.saveListingsToDatabase(transformedListings);
    // await this.scraperService.saveAnnouncementsToDatabase(allAnnouncements);
  }

  @Cron('0 * * * *')
  async handleFactsheetPdfGeneration() {
    const title = 'factsheet';
    const templateFile = `${title}.html`;

    // Use a known list of index names — or fetch from DB
    const indexNames = ['SY100', 'SYAZ', 'SYL2', 'SYDF', 'SYAI', 'SYME'];

    const jsonPath = path.resolve(
      __dirname,
      `../../../templates/${title}.json`,
    );
    if (!fs.existsSync(jsonPath)) {
      console.error(`Base template JSON not found: ${jsonPath}`);
      return;
    }

    const rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    for (const indexName of indexNames) {
      try {
        const jsonData = await this.pdfService.updateFactsheetData(
          indexName,
          rawJson,
        );
        const pdfPath = await this.pdfService.generatePdfFromHtml(
          templateFile,
          jsonData,
          title,
          indexName,
        );

        console.log(`PDF generated: ${pdfPath}`);
      } catch (err) {
        console.error(
          `Failed to generate PDF for ${indexName}: ${err.message}`,
        );
      }
    }
  }
}
