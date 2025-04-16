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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dbService: DbService,
  ) {}

  async getMarketCap(): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
          // x_cg_pro_api_key: process.env.COINGECKO_API_KEY,
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
        },
      }),
    );
    const coins = response.data;
    for (const coin of coins.slice(0, 100)) {
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
        .onConflictDoUpdate({
          target: tokenMetadata.coinGeckoId,
          set: {
            categories,
            marketCap: coin.market_cap,
            fetchedAt: new Date(),
          },
        });
    }
    return coins;
  }

  async getOHLC(coinId: string): Promise<number[][]> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
        {
          params: {
            vs_currency: 'usd',
            days: '1',
            // x_cg_pro_api_key: process.env.COINGECKO_API_KEY,
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
          },
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
            // x_cg_pro_api_key: process.env.COINGECKO_API_KEY 
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
          },
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
          // x_cg_pro_api_key: process.env.COINGECKO_API_KEY,
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
        },
      }),
    );
    return response.data[coinId]?.usd || 0;
  }
}
