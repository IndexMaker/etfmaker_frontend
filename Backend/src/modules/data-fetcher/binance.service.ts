import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DbService } from '../../db/db.service';
import { binancePairs } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

interface BinancePair {
  symbol: string;
  quoteAsset: string;
  status: string;
}

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly apiUrl = 'https://data-api.binance.vision/api/v3/exchangeInfo';

  constructor(
    private httpService: HttpService,
    private dbService: DbService,
  ) {}

  async fetchTradingPairs(): Promise<BinancePair[]> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.apiUrl));
      const data = response.data;

      // Filter for pairs ending in USDT or USDC
      const pairs = data.symbols
        .filter((symbol: any) => ['USDT', 'USDC'].includes(symbol.quoteAsset))
        .map((symbol: any) => ({
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
      await this.dbService.getDb().insert(binancePairs).values(
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

  async detectListingsAndDelistings(): Promise<{ listings: string[]; delistings: string[] }> {
    try {
      // Fetch current pairs
      const currentPairs = await this.fetchTradingPairs();
      const currentSymbols = new Set(currentPairs.filter((p) => p.status === 'TRADING').map((p) => p.symbol));

      // Fetch previous pairs (from yesterday or latest snapshot)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const previousPairs = await this.dbService
        .getDb()
        .select()
        .from(binancePairs)
        .where(and(eq(binancePairs.fetchedAt, yesterday)))
        .execute();
      const previousSymbols: Set<string> = new Set(previousPairs.filter((p: BinancePair) => p.status === 'TRADING').map((p: BinancePair) => p.symbol));

      // Detect listings (new symbols in current but not in previous)
      const listings = Array.from(currentSymbols).filter((symbol) => !previousSymbols.has(symbol));

      // Detect delistings (symbols in previous but not in current or not TRADING)
      const delistings: string[] = Array.from(previousSymbols).filter(
        (symbol: string) => !currentSymbols.has(symbol) || currentPairs.find((p) => p.symbol === symbol)?.status !== 'TRADING',
      );

      // Store current pairs for future comparison
      await this.storeTradingPairs(currentPairs);

      this.logger.log(`Detected ${listings.length} listings and ${delistings.length} delistings`);
      return { listings, delistings };
    } catch (error) {
      this.logger.error(`Error detecting listings/delistings: ${error.message}`);
      return { listings: [], delistings: [] };
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
}