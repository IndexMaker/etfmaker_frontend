import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DbService } from 'src/db/db.service';
import {
  coinSymbols,
  historicalPrices,
  tokenCategories,
  tokenMetadata,
} from 'src/db/schema';
import { ethers } from 'ethers';
import { and, desc, eq, lte, sql } from 'drizzle-orm';
import axios from 'axios';
@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private priceCache: Record<string, Array<[number, number]>> = {};
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  constructor(
    private httpService: HttpService,
    private dbService: DbService,
  ) {}

  async getAllCoinsList(): Promise<
    { id: string; symbol: string; name: string }[]
  > {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://pro-api.coingecko.com/api/v3/coins/list',
          {
            headers: {
              accept: 'application/json',
              'x-cg-pro-api-key': process.env.COINGECKO_API_KEY!,
            },
          },
        ),
      );
      const coins = response.data as {
        id: string;
        symbol: string;
        name: string;
      }[];

      return coins;
    } catch (error) {
      throw new Error(`Failed to fetch CoinGecko coin list: ${error.message}`);
    }
  }

  async getSymbolToIdsMap(): Promise<Record<string, string>> {
    // Try to get from database first
    // const dbResult = await this.getFromDatabase();
    // if (dbResult) {
    //   return dbResult;
    // }

    // If not in database, fetch from API and store
    return this.fetchAndStoreFromApi();
  }

  private async getFromDatabase(): Promise<Record<string, string> | null> {
    try {
      const records = await this.dbService.getDb().select().from(coinSymbols);
      if (records.length === 0) {
        return null;
      }
      return records.reduce(
        (acc, record) => {
          acc[record.symbol] = record.coinId;
          return acc;
        },
        {} as Record<string, string>,
      );
    } catch (error) {
      console.error('Error fetching from database:', error);
      return null;
    }
  }

  private async fetchAndStoreFromApi(): Promise<Record<string, string>> {
    const response = await firstValueFrom(
      this.httpService.get('https://pro-api.coingecko.com/api/v3/coins/list', {
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.COINGECKO_API_KEY!,
        },
      }),
    );

    const coins: Array<{ id: string; symbol: string; name: string }> =
      response.data;
    const candidatesMap: Record<
      string,
      Array<{ id: string; name: string }>
    > = {};

    for (const coin of coins) {
      const symbolUpper = coin.symbol.toUpperCase();
      if (!candidatesMap[symbolUpper]) {
        candidatesMap[symbolUpper] = [];
      }
      candidatesMap[symbolUpper].push({ id: coin.id, name: coin.name });
    }

    const result: Record<string, string> = {};
    const dbInserts: Array<{ symbol: string; coinId: string }> = [];

    for (const [symbol, candidates] of Object.entries(candidatesMap)) {
      const bestId = this.selectBestId(symbol, candidates);
      if (bestId) {
        result[symbol] = bestId;
        dbInserts.push({ symbol, coinId: bestId });
      }
    }

    // Store in database
    // await this.storeInDatabase(dbInserts);

    return result;
  }

  private async storeInDatabase(
    data: Array<{ symbol: string; coinId: string }>,
  ): Promise<void> {
    try {
      // Using transaction for bulk insert
      await this.dbService.getDb().transaction(async (tx) => {
        // Clear existing data
        await tx.delete(coinSymbols);

        // Insert new data
        for (const item of data) {
          await tx
            .insert(coinSymbols)
            .values({
              symbol: item.symbol,
              coinId: item.coinId,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: coinSymbols.symbol,
              set: {
                coinId: item.coinId,
                updatedAt: new Date(),
              },
            });
        }
      });
    } catch (error) {
      console.error('Error storing in database:', error);
      throw error;
    }
  }

  private selectBestId(
    symbol: string,
    candidates: Array<{ id: string; name: string }>,
  ): string | null {
    if (candidates.length === 0) return null;

    const symbolLower = symbol.toLowerCase();

    // Special cases for common symbols that might have conflicts
    const SPECIAL_CASES: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'tether',
      BNB: 'binancecoin',
      XRP: 'ripple',
      SOL: 'solana',
      DOGE: 'dogecoin',
      // Add other special cases as needed
    };

    // Check if this symbol has a special case handling
    if (SPECIAL_CASES[symbol.toUpperCase()]) {
      return SPECIAL_CASES[symbol.toUpperCase()];
    }

    // Sort candidates by quality (most likely to be the main coin first)
    const sortedCandidates = [...candidates].sort((a, b) => {
      // Prefer exact symbol matches (btc -> bitcoin)
      const aExactMatch = a.id === symbolLower ? 1 : 0;
      const bExactMatch = b.id === symbolLower ? 1 : 0;
      if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;

      // Prefer clean IDs (no wormhole, wrapped, etc.)
      const aClean = this.isCleanId(a.id) && this.isCleanId(a.name) ? 1 : 0;
      const bClean = this.isCleanId(b.id) && this.isCleanId(b.name) ? 1 : 0;
      if (aClean !== bClean) return bClean - aClean;

      // Prefer shorter IDs (bitcoin vs bitcoin-2)
      if (a.id.length !== b.id.length) return a.id.length - b.id.length;

      // Prefer more "mainstream" names (contains "bitcoin" rather than "bitcoin cash")
      const aMainstream = this.isMainstream(a.name);
      const bMainstream = this.isMainstream(b.name);
      if (aMainstream !== bMainstream) return bMainstream ? -1 : 1;

      // Finally, sort alphabetically as tiebreaker
      return a.id.localeCompare(b.id);
    });

    return sortedCandidates[0]?.id || null;
  }

  private isCleanId(idOrName: string): boolean {
    const forbidden = [
      'wormhole',
      'wrapped',
      'bridged',
      'peg',
      'binance-peg',
      'anchor',
      'portal',
      'token',
      'old',
      '-old',
      '-2',
      '-3',
      'deprecated',
      'legacy',
      'renbtc',
    ];
    return !forbidden.some((f) => idOrName.toLowerCase().includes(f));
  }

  private isMainstream(name: string): boolean {
    const mainstreamKeywords = [
      'bitcoin',
      'ethereum',
      'ripple',
      'litecoin',
      'cardano',
      'polkadot',
      'stellar',
      'chainlink',
      'binance',
      'tether',
      'monero',
      'dogecoin',
    ];
    return mainstreamKeywords.some((k) =>
      name.toLowerCase().includes(k.toLowerCase()),
    );
  }

  async getHistoricalMarketCapsByIds(
    ids: string[],
    date: string,
  ): Promise<any[]> {
    // Format: dd-mm-yyyy (e.g., "01-01-2020")
    const historicalData = await Promise.all(
      ids.map(async (id) => {
        const response = await firstValueFrom(
          this.httpService.get(
            `https://pro-api.coingecko.com/api/v3/coins/${id}/history`,
            {
              params: {
                date,
                localization: 'false',
              },
              headers: {
                'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
              },
            },
          ),
        );
        return {
          id,
          market_cap: response.data.market_data?.market_cap?.usd,
          price: response.data.market_data?.current_price?.usd,
          date,
        };
      }),
    );
    return historicalData;
  }

  async getMarketCapsByIds(ids: string[]): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://pro-api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: ids.join(','), // comma-separated list
            order: 'market_cap_desc',
            sparkline: false,
            per_page: ids.length,
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );

    return response.data;
  }

  async getMarketCapsByRank(page: number, chunkSize: number): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://pro-api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            sparkline: false,
            per_page: chunkSize,
            page: page,
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );

    return response.data;
  }

  async getTokenMarketChart(
    id: string,
    currency: string = 'usd',
  ): Promise<Array<[number, number]>> {
    if (this.priceCache[id]) {
      return this.priceCache[id];
    }

    const response = await firstValueFrom(
      this.httpService.get(
        `https://pro-api.coingecko.com/api/v3/coins/${id}/market_chart`,
        {
          params: {
            vs_currency: currency,
            days: '3000',
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );

    const prices: Array<[number, number]> = response.data.prices; // [ [timestamp, price], ... ]
    this.priceCache[id] = prices;

    return prices;
  }

  async getMarketCap(
    limit: number = 250,
    page: number = 1,
    options: { ids?: string } = {},
  ): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://pro-api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: page,
            sparkline: false,
            ...options,
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );
    const coins = response.data;

    // Filter based on atl_date
    const filteredTokens = coins.filter((token: any) => {
      if (!token.atl_date) return false; // no date? skip
      const atlDate = new Date(token.atl_date);
      return atlDate >= new Date('2022-01-01');
    });
    for (const coin of filteredTokens) {
      // const categories = await this.getCategories(coin.id);
      // await this.dbService.getDb().insert(tokenMetadata).values({
      //   coinGeckoId: coin.id,
      //   symbol: coin.symbol,
      //   categories,
      //   marketCap: coin.market_cap,
      //   fetchedAt: new Date(),
      // });
      // .onConflictDoUpdate({
      //   target: tokenMetadata.coinGeckoId,
      //   set: {
      //     categories,
      //     marketCap: coin.market_cap,
      //     fetchedAt: new Date(),
      //   },
      // });
      // Sleep between requests to avoid hitting 30 requests/min limit
      // await sleep(2500); // 2.5 seconds pause (~24 requests/min safe)
    }
    return coins;
  }

  async resolveTokenAddressFromCoinGecko(coinId: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://pro-api.coingecko.com/api/v3/coins/${coinId}`,
          {
            headers: {
              accept: 'application/json',
              'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
            },
          },
        ),
      );
      const platforms = response.data.platforms;

      const ethereumAddress = platforms?.ethereum;

      if (!ethereumAddress) {
        return ethers.ZeroAddress;
      }

      return ethereumAddress;
    } catch (error) {
      console.error(
        `Failed to resolve token address for ${coinId}: ${error.message}`,
      );
      return ethers.ZeroAddress;
    }
  }

  async getPortfolioTokens(
    category,
    options: { ids?: string } = {},
  ): Promise<any[]> {
    // Fetch a16z Portfolio tokens from CoinGecko
    const response = await firstValueFrom(
      this.httpService.get(
        'https://pro-api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            category: category,
            order: 'market_cap_desc',
            page: 1,
            per_page: 250,
            ...options,
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );
    return response.data || [];
  }

  async getOHLC(coinId: string): Promise<number[][]> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://pro-api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
        {
          params: {
            vs_currency: 'usd',
            days: '1',
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );
    return response.data;
  }

  // Helper functions
  async fetchCoinGeckoMarkets(coinIds: string[]) {
    const response = await firstValueFrom(
      this.httpService.get('https://pro-api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','), // array of IDs like ['bitcoin', 'ethereum']
          order: 'market_cap_desc',
        },
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
        },
      }),
    );
    
    return response.data;
  }

  async getOrCreateCategory(coinId: string): Promise<string> {
    if (!coinId) return 'Uncategorized';
    // Try to get existing category
    const existing = await this.dbService
      .getDb()
      .query.tokenCategories.findFirst({
        where: eq(tokenCategories.coinId, coinId),
      });

    if (existing) {
      return existing.categories[0] || 'Uncategorized';
    }

    const categories = await this.getCategories(coinId);
    // Store new category if we have data
    const sector = categories[0] || 'Uncategorized';
    if (categories.length > 0) {
      await this.dbService
        .getDb()
        .insert(tokenCategories)
        .values({
          coinId,
          categories: JSON.stringify(categories),
        })
        .onConflictDoNothing();
    }

    return sector;
  }

  async getCategories(coinId: string): Promise<string[]> {
    if (!coinId) return [];

    const db = this.dbService.getDb();

    // Step 1: Try to get from DB
    const existing = await db.query.tokenCategories.findFirst({
      where: eq(tokenCategories.coinId, coinId),
    });

    if (existing) {
      // Directly return the JSONB array
      return existing.categories || [];
    }

    // Step 2: If not in DB, fetch from CoinGecko
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://pro-api.coingecko.com/api/v3/coins/${coinId}`,
          {
            headers: {
              accept: 'application/json',
              'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
            },
          },
        ),
      );

      const categories = response.data.categories || [];

      // Step 3: Save to DB (insert raw array into jsonb column)
      if (categories.length > 0) {
        await db
          .insert(tokenCategories)
          .values({
            coinId,
            categories: JSON.stringify(categories), // <- array inserted as-is into JSONB column
          })
          .onConflictDoNothing();
      }

      return categories;
    } catch (error) {
      this.logger.error(
        `Error fetching categories for ${coinId}: ${error.message}`,
      );
      return [];
    }
  }

  async getLivePrice(coinId: string): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://pro-api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
          },
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        },
      ),
    );
    return response.data[coinId]?.usd || 0;
  }

  async storeDailyPricesForToken(
    id: string,
    symbol: string,
    rebalanceTimestamp: number,
  ) {
    const db = this.dbService.getDb();

    // Check if any prices already exist for this token
    const exists = await db
      .select({ count: sql<number>`count(*)` })
      .from(historicalPrices)
      .where(eq(historicalPrices.coinId, id));
    if (exists[0].count > 0) return;

    const url = `https://pro-api.coingecko.com/api/v3/coins/${id}/market_chart`;
    const params = {
      vs_currency: 'usd',
      days: 2400,
    };

    const response = await firstValueFrom(
      this.httpService.get(url, {
        params,
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
        },
      }),
    );

    const prices: [number, number][] = response.data.prices; // [ [timestamp(ms), price], ... ]
    if (!prices || prices.length === 0) return;

    // Check if the earliest available price is after the rebalance timestamp
    const earliestTimestamp = Math.floor(prices[0][0] / 1000); // ms to s
    if (earliestTimestamp > rebalanceTimestamp) {
      console.log(
        `⏭ Skipped ${symbol} (${id}) — no data before rebalance timestamp`,
      );
      return;
    }

    for (const [timestampMs, price] of prices) {
      const timestamp = Math.floor(timestampMs / 1000); // Convert to seconds

      // Check if price already exists
      const exists = await db
        .select({ count: sql<number>`count(*)` })
        .from(historicalPrices)
        .where(
          and(
            eq(historicalPrices.coinId, id),
            eq(historicalPrices.timestamp, timestamp),
          ),
        );

      if (exists[0].count > 0) continue;

      await db.insert(historicalPrices).values({
        coinId: id,
        symbol,
        timestamp,
        price,
      });
    }

    console.log(`✅ Stored daily prices for ${symbol} (${id})`);
  }

  async getOrFetchTokenPriceAtTimestamp(
    coinId: string,
    symbol: string,
    timestamp: number,
  ): Promise<number | null> {
    const db = this.dbService.getDb();

    // Normalize timestamp to daily UTC (00:00)
    const normalizedDate = new Date(timestamp * 1000);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const normalizedUnix = Math.floor(normalizedDate.getTime() / 1000);

    // 1. Try exact timestamp match in DB first
    const exactMatch = await db
      .select({ price: historicalPrices.price })
      .from(historicalPrices)
      .where(
        and(
          eq(historicalPrices.coinId, coinId),
          eq(historicalPrices.timestamp, normalizedUnix),
        ),
      )
      .limit(1);

    if (exactMatch.length) {
      return exactMatch[0].price;
    }

    // 2. Try to find the closest historical price in DB (before or after)
    const closestPrice = await db
      .select({
        price: historicalPrices.price,
        timestamp: historicalPrices.timestamp,
      })
      .from(historicalPrices)
      .where(eq(historicalPrices.coinId, coinId))
      .orderBy(sql`ABS(${historicalPrices.timestamp} - ${normalizedUnix}) ASC`)
      .limit(1);

    if (closestPrice.length) {
      const { price, timestamp: foundTimestamp } = closestPrice[0];
      const diff = Math.abs(foundTimestamp - normalizedUnix);

      // If we found a price within 30 days, use it
      if (diff <= 30 * 24 * 60 * 60) {
        // 30 days in seconds
        return price;
      }
    }

    // 3. Fetch from CoinGecko with wider range (90 days before and after)
    const rangeDays = 90;
    const from = normalizedUnix - rangeDays * 24 * 60 * 60;
    const to = normalizedUnix + rangeDays * 24 * 60 * 60;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://pro-api.coingecko.com/api/v3/coins/${coinId}/market_chart/range`,
          {
            params: {
              vs_currency: 'usd',
              from,
              to,
            },
            headers: {
              accept: 'application/json',
              'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
            },
          },
        ),
      );

      const prices: [number, number][] = response.data?.prices ?? [];

      if (prices.length === 0) {
        // this.logger.warn(
        //   `No historical price data returned from CoinGecko for ${coinId} between ${from} and ${to}`,
        // );
        return null;
      }

      // 4. Find the price point closest to our target date
      let closestPrice: { timestamp: number; price: number } | null = null;
      let smallestDiff = Infinity;

      for (const [tsMs, price] of prices) {
        const ts = Math.floor(tsMs / 1000);
        const diff = Math.abs(ts - normalizedUnix);

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestPrice = { timestamp: ts, price };
        }
      }

      if (!closestPrice) {
        this.logger.warn(
          `No valid price points found in CoinGecko response for ${coinId}`,
        );
        return null;
      }

      return closestPrice.price;
    } catch (error) {
      this.logger.error(
        `Failed to fetch historical price for ${coinId}: ${error.message}`,
      );
      return null;
    }
  }

  async storeMissingPricesUntilToday() {
    // Normalize today's date to UTC midnight
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(now.getTime() / 1000);

    // Step 1: Get latest prices (Drizzle query)
    const latestPrices = await this.dbService
      .getDb()
      .select({
        coin_id: historicalPrices.coinId,
        symbol: historicalPrices.symbol,
        timestamp: sql<number>`MAX(${historicalPrices.timestamp})`.as(
          'timestamp',
        ),
      })
      .from(historicalPrices)
      .groupBy(historicalPrices.coinId, historicalPrices.symbol)
      .execute();

    if (!latestPrices.length) return;

    // Step 2: Process tokens in parallel
    const allMissingPrices: {
      coinId: string;
      symbol: string;
      timestamp: number;
      price: number;
    }[] = [];

    await Promise.all(
      latestPrices.map(async ({ coin_id, symbol }) => {
        try {
          const lastTimestamp = await this.getLastNormalizedTimestamp(coin_id);
          if (!lastTimestamp) return;

          // Calculate 30 days ago in seconds (86400 seconds/day × 30 days)
          const thirtyDaysAgo = todayTimestamp - 86400 * 30;

          // Skip if lastTimestamp is older than 30 days
          if (lastTimestamp < thirtyDaysAgo) {
            this.logger.log(
              `Skipping ${symbol} - last update was over 30 days ago`,
            );
            return;
          }

          // Generate all missing timestamps
          const missingTimestamps = this.generateDailyTimestamps(
            lastTimestamp + 86400, // Next day
            todayTimestamp,
          );

          if (missingTimestamps.length === 0) return;

          // Get all prices in a single API call
          const from = missingTimestamps[0];
          const to = missingTimestamps[missingTimestamps.length - 1];

          try {
            const response = await firstValueFrom(
              this.httpService.get(
                `https://pro-api.coingecko.com/api/v3/coins/${coin_id}/market_chart/range`,
                {
                  params: {
                    vs_currency: 'usd',
                    from,
                    to,
                  },
                  headers: {
                    accept: 'application/json',
                    'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
                  },
                },
              ),
            );

            const prices: [number, number][] = response.data?.prices ?? [];
            if (prices.length === 0) return;

            // Create a map of normalized dates to prices
            const priceMap = new Map<number, number>();
            for (const [tsMs, price] of prices) {
              const ts = Math.floor(tsMs / 1000);
              const date = new Date(ts * 1000);
              date.setUTCHours(0, 0, 0, 0);
              const normalizedTs = Math.floor(date.getTime() / 1000);
              priceMap.set(normalizedTs, price);
            }

            // Match missing timestamps with available prices
            missingTimestamps.forEach((timestamp) => {
              const price = priceMap.get(timestamp);
              if (price !== undefined) {
                allMissingPrices.push({
                  coinId: coin_id,
                  symbol,
                  timestamp,
                  price,
                });
              }
            });
          } catch (err) {
            this.logger.error(
              `Failed to fetch prices for ${symbol}: ${err.message}`,
            );
          }
        } catch (err) {
          this.logger.error(`Error processing ${symbol}: ${err.message}`);
        }
      }),
    );

    // Step 3: Batch insert with Drizzle
    if (allMissingPrices.length > 0) {
      try {
        await this.dbService.getDb().transaction(async (tx) => {
          // Chunk inserts if needed (e.g., 1000 records at a time)
          const chunkSize = 1000;
          for (let i = 0; i < allMissingPrices.length; i += chunkSize) {
            const chunk = allMissingPrices.slice(i, i + chunkSize);
            await tx
              .insert(historicalPrices)
              .values(chunk)
              .onConflictDoNothing();
          }
        });
        this.logger.log(`Stored ${allMissingPrices.length} prices in batch`);
      } catch (err) {
        this.logger.error(`Batch insert failed: ${err.message}`);
      }
    }
  }

  // Helper: Get last normalized (UTC midnight) timestamp for a coin
  private async getLastNormalizedTimestamp(
    coinId: string,
  ): Promise<number | null> {
    const result = await this.dbService
      .getDb()
      .select({ timestamp: historicalPrices.timestamp })
      .from(historicalPrices)
      .where(eq(historicalPrices.coinId, coinId))
      .orderBy(desc(historicalPrices.timestamp))
      .limit(1);

    if (!result.length) return null;

    // Normalize to UTC midnight
    const date = new Date(result[0].timestamp * 1000);
    date.setUTCHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  }

  // Helper: Generate daily timestamps between two dates (inclusive)
  private generateDailyTimestamps(start: number, end: number): number[] {
    const timestamps: number[] = [];
    let current = start;

    while (current <= end) {
      timestamps.push(current);
      current += 86400; // Add 1 day in seconds
    }

    return timestamps;
  }

  async getCoinData(path: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://pro-api.coingecko.com/api/v3${path}`, {
          headers: {
            accept: 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch CoinGecko data for path: ${path}`,
        error.message,
      );
      return null;
    }
  }

  async getSymbolFromCoinGecko(coinId: string): Promise<string | null> {
    try {
      // Fetch coin details from CoinGecko API
      const response = await firstValueFrom(
        this.httpService.get(
          `https://pro-api.coingecko.com/api/v3/coins/${coinId}`,
          {
            headers: {
              accept: 'application/json',
              'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
            },
          },
        ),
      );

      if (!response.data) {
        console.error(`Failed to fetch CoinGecko data for ${coinId}`);
        return null;
      }

      const data = await response.data;
      const symbol = data.symbol?.toLowerCase();

      if (symbol) {
        // Store the new mapping in the database using Drizzle
        await this.dbService
          .getDb()
          .insert(coinSymbols)
          .values({
            coinId: coinId,
            symbol: symbol,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: coinSymbols.coinId,
            set: {
              symbol: symbol,
              updatedAt: new Date(),
            },
          });

        return symbol;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching symbol for ${coinId}:`, error);
      return null;
    }
  }

  async getUSDCUSDPrice(coinId: string): Promise<number> {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    try{
      const data = await res.json();
      return data[coinId]?.usd || 1;
    }
    catch{
      return 1;
    }
  }
}
