import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DbService } from '../../db/db.service';
import { binancePairs } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
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
      const response = await firstValueFrom(this.httpService.get(this.apiUrl));
      const data = response.data;

      const pairs = data.symbols.map((symbol: any) => ({
        symbol: symbol.symbol,
        quoteAsset: symbol.quoteAsset,
        status: symbol.status,
      }));

      this.logger.log(`Fetched ${pairs.length} trading pairs from Binance`);
      return pairs;
    } catch (error) {
      this.logger.error(`Error fetching trading pairs: ${error.message}`);
      return [];
    }
  }

  async storeTradingPairs(pairs: BinancePair[]): Promise<void> {
    try {
      await this.dbService
        .getDb()
        .insert(binancePairs)
        .values(
          pairs.map((pair) => ({
            symbol: pair.symbol,
            quoteAsset: pair.quoteAsset,
            status: pair.status,
            fetchedAt: new Date(),
          })),
        );
      this.logger.log(`Stored ${pairs.length} trading pairs in database`);
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
      await this.storeTradingPairs(currentPairs);

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
