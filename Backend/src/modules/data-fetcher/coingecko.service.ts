import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DbService } from 'src/db/db.service';
import { tokenMetadata } from 'src/db/schema';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  constructor(
    private httpService: HttpService,
    private dbService: DbService,
  ) {}

  async getMarketCap(limit: number = 250, options: { ids?: string } = {}): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          ...options,
        },
        headers: {
          'accept': "application/json",
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
        }
      }),
    );
    const coins = response.data;

    // Filter based on atl_date
    const filteredTokens = coins.filter((token: any) => {
      if (!token.atl_date) return false; // no date? skip
      const atlDate = new Date(token.atl_date);
      return atlDate >= new Date('2022-01-01');
    });
    for (const coin of filteredTokens) {
      const categories = await this.getCategories(coin.id);
      await this.dbService
        .getDb()
        .insert(tokenMetadata)
        .values({
          coinGeckoId: coin.id,
          symbol: coin.symbol,
          categories,
          marketCap: coin.market_cap,
          fetchedAt: new Date(),
        })
        // .onConflictDoUpdate({
        //   target: tokenMetadata.coinGeckoId,
        //   set: {
        //     categories,
        //     marketCap: coin.market_cap,
        //     fetchedAt: new Date(),
        //   },
        // });
    }
    return coins;
  }

  async getA16zPortfolioTokens(options: {ids?: string} = {}): Promise<any[]> {
    // Fetch a16z Portfolio tokens from CoinGecko
    const response = await firstValueFrom(this.httpService.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          category: "a16z-portfolio",
          order: 'market_cap_desc',
          page: 1,
          per_page: 250,
          ...options,
        },
        headers: {
          'accept': "application/json",
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
        }
      })
    )
    return response.data || []
  }

  async getOHLC(coinId: string): Promise<number[][]> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
        {
          params: {
            vs_currency: 'usd',
            days: '1',
          },
          headers: {
            'accept': "application/json",
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          }
        },
      ),
    );
    return response.data;
  }

  async getCategories(coinId: string): Promise<string[]> {
    // const cacheKey = `categories:${coinId}`;
    // const cached = await this.cacheManager.get<string[]>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
          params: { 
          },
          headers: {
            'accept': "application/json",
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          }
        }),
      );
      const categories = response.data.categories || [];
      // await this.cacheManager(cacheKey, categories, { ttl: 24 * 60 * 60 }); // Cache for 24 hours
      return categories;
    } catch (error) {
      this.logger.error(`Error fetching categories for ${coinId}: ${error.message}`);
      return [];
    }
  }

  async getLivePrice(coinId: string): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
        },
        headers: {
          'accept': "application/json",
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
        }
      }),
    );
    return response.data[coinId]?.usd || 0;
  }
}
