import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DbService } from '../../db/db.service';
import { binanceListings, binancePairs } from '../../db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';

interface BinancePair {
  symbol: string;
  quoteAsset: string;
  status: string;
}

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly apiUrl =
    'https://data-api.binance.vision/api/v3/exchangeInfo';

  constructor(
    private httpService: HttpService,
    private dbService: DbService,
  ) {}

  async fetchTradingPairs(): Promise<BinancePair[]> {
    try {
      const db = this.dbService.getDb();

      const pairs = await db
        .select()
        .from(binancePairs)
        .where(eq(binancePairs.status, 'TRADING'));

      this.logger.log(`Fetched ${pairs.length} trading pairs from database`);
      return pairs;
    } catch (error) {
      this.logger.error(
        `Error fetching trading pairs from DB: ${error.message}`,
      );
      return [];
    }
  }

  async storeTradingPairs(): Promise<void> {
    try {
      // Fetch from Binance API
      const response = await firstValueFrom(this.httpService.get(this.apiUrl));
      const data = response.data;

      const pairs: BinancePair[] = data.symbols.map((symbol: any) => ({
        symbol: symbol.symbol,
        quoteAsset: symbol.quoteAsset,
        status: symbol.status,
      }));

      const db = this.dbService.getDb();

      // Truncate the table
      await db.execute(sql`TRUNCATE TABLE ${binancePairs}`);

      // Insert fresh pairs
      await db.insert(binancePairs).values(
        pairs.map((pair) => ({
          symbol: pair.symbol,
          quoteAsset: pair.quoteAsset,
          status: pair.status,
          fetchedAt: new Date(),
        })),
      );

      this.logger.log(
        `Fetched and stored ${pairs.length} trading pairs from Binance`,
      );
    } catch (error) {
      this.logger.error(`Error storing trading pairs: ${error.message}`);
    }
  }

  async detectListingsAndDelistings(): Promise<{
    listings: string[];
    delistings: string[];
  }> {
    try {
      // Fetch current pairs
      const currentPairs = await this.fetchTradingPairs();
      const currentSymbols = new Set(
        currentPairs.filter((p) => p.status === 'TRADING').map((p) => p.symbol),
      );

      // Fetch previous pairs (from yesterday or latest snapshot)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const previousPairs = await this.dbService
        .getDb()
        .select()
        .from(binancePairs)
        .where(and(eq(binancePairs.fetchedAt, yesterday)))
        .execute();
      const previousSymbols: Set<string> = new Set(
        previousPairs
          .filter((p: BinancePair) => p.status === 'TRADING')
          .map((p: BinancePair) => p.symbol),
      );

      // Detect listings (new symbols in current but not in previous)
      const listings = Array.from(currentSymbols).filter(
        (symbol) => !previousSymbols.has(symbol),
      );

      // Detect delistings (symbols in previous but not in current or not TRADING)
      const delistings: string[] = Array.from(previousSymbols).filter(
        (symbol: string) =>
          !currentSymbols.has(symbol) ||
          currentPairs.find((p) => p.symbol === symbol)?.status !== 'TRADING',
      );

      // Store current pairs for future comparison
      await this.storeTradingPairs();

      this.logger.log(
        `Detected ${listings.length} listings and ${delistings.length} delistings`,
      );
      return { listings, delistings };
    } catch (error) {
      this.logger.error(
        `Error detecting listings/delistings: ${error.message}`,
      );
      return { listings: [], delistings: [] };
    }
  }

  async getListingTimestampFromS3(
    pair: string,
    interval = '30m',
    retryCount = 0,
  ): Promise<number | null> {
    const maxRetries = 3;
    const baseUrl =
      'https://s3-ap-northeast-1.amazonaws.com/data.binance.vision';
    const pairUrl = `${baseUrl}?delimiter=/&prefix=data/spot/monthly/klines/${pair}/${interval}/`;

    try {
      const response = await axios.get(pairUrl);
      const xmlData = response.data;
      const result = await parseStringPromise(xmlData);
      const contents = result.ListBucketResult.Contents || [];

      const zipFiles = contents
        .map((item: any) => ({
          key: item.Key[0],
          url: `${baseUrl}/${item.Key[0]}`,
        }))
        .filter(
          (item) => item.key.endsWith('.zip') && !item.key.includes('CHECKSUM'),
        );

      if (zipFiles.length === 0 && retryCount < maxRetries) {
        return await this.getListingTimestampFromS3(
          pair,
          interval,
          retryCount + 1,
        );
      }

      if (zipFiles.length === 0 && interval === '30m') {
        return await this.getListingTimestampFromS3(pair, '1d', 0);
      }

      if (zipFiles.length === 0) return null;

      zipFiles.sort((a, b) => {
        const dateA = a.key.match(/(\d{4}-\d{2})\.zip$/)?.[1] || '';
        const dateB = b.key.match(/(\d{4}-\d{2})\.zip$/)?.[1] || '';
        return dateA.localeCompare(dateB);
      });

      const firstZip = zipFiles[0];
      const zipResp = await axios.get(firstZip.url, {
        responseType: 'arraybuffer',
      });
      const zipBuffer = Buffer.from(zipResp.data);
      const zipFile = new AdmZip(zipBuffer);
      const csvEntry = zipFile
        .getEntries()
        .find((e) => e.entryName.endsWith('.csv'));
      if (!csvEntry) return null;

      const csvText = zipFile.readAsText(csvEntry);
      const rows = parse(csvText, { skip_empty_lines: true });
      return this.parseFlexibleTimestamp(parseInt(rows[0][0], 10)); // First open_time
    } catch (err: any) {
      if (retryCount < maxRetries) {
        return await this.getListingTimestampFromS3(
          pair,
          interval,
          retryCount + 1,
        );
      }
      console.error(`Failed to fetch listing date for ${pair}:`, err.message);
      return null;
    }
  }

  async storePairListingTimestamps(): Promise<void> {
    try {
      const db = this.dbService.getDb();

      // Fetch TRADING pairs from DB
      const allPairs = await this.fetchTradingPairs();

      // Filter for USDT/USDC quote assets
      const filteredPairs = allPairs.filter((pair) =>
        ['USDT', 'USDC'].includes(pair.quoteAsset),
      );

      if (filteredPairs.length === 0) {
        this.logger.warn('No USDT/USDC trading pairs found');
        return;
      }

      const pairSymbols = filteredPairs.map((pair) => pair.symbol);

      // Fetch already stored listing symbols
      const existingListings = await db
        .select({ pair: binanceListings.pair })
        .from(binanceListings)
        .where(inArray(binanceListings.pair, pairSymbols));

      const existingSymbols = new Set(existingListings.map((l) => l.pair));

      const listings: any[] = [];

      for (const pair of filteredPairs) {
        if (existingSymbols.has(pair.symbol)) {
          this.logger.log(`Skipping ${pair.symbol}, already in DB`);
          continue;
        }

        const timestamp = await this.getListingTimestampFromS3(pair.symbol);

        if (timestamp) {
          listings.push({
            pair: pair.symbol,
            action: 'listing',
            timestamp,
            createdAt: new Date(),
          });
          this.logger.log(
            `Fetched listing timestamp for ${pair.symbol}: ${timestamp}`,
          );
        } else {
          this.logger.warn(`No listing timestamp found for ${pair.symbol}`);
        }
      }

      if (listings.length > 0) {
        await db.insert(binanceListings).values(listings);
        this.logger.log(
          `Stored ${listings.length} new listing timestamps in DB`,
        );
      } else {
        this.logger.log('No new listing timestamps to store');
      }
    } catch (error) {
      this.logger.error(`Error storing listing timestamps: ${error.message}`);
    }
  }

  async getListedTokens(): Promise<string[]> {
    try {
      const pairs = await this.fetchTradingPairs();
      const tokens = pairs
        .filter((pair) => pair.status === 'TRADING')
        .map((pair) => pair.symbol)
        .filter((token) => token); // Remove empty strings
      return [...new Set(tokens)]; // Remove duplicates
    } catch (error) {
      this.logger.error(`Error getting listed tokens: ${error.message}`);
      return [];
    }
  }

  parseFlexibleTimestamp(timestamp: number) {
    const ts = Number(timestamp);

    const tsString = ts.toString();
    const digitCount = tsString.length;

    let milliseconds;

    if (digitCount <= 13) {
      milliseconds = ts;
    } else if (digitCount <= 16) {
      milliseconds = Math.floor(ts / 1000);
    } else {
      milliseconds = Math.floor(ts / 1000000);
    }

    return milliseconds;
  }
}
