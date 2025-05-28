// src/bitget/bitget.service.ts
import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { bitgetListings } from "src/db/schema";
import { and, eq } from "drizzle-orm";
import { firstValueFrom } from 'rxjs';
import { Cron } from '@nestjs/schedule';

interface BitgetContract {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  symbolStatus: string;
}

@Injectable()
export class BitgetService {
  private readonly logger = new Logger(BitgetService.name);
  private readonly endpoints = {
    USDT: 'https://api.bitget.com/api/mix/v1/market/contracts?productType=umcbl',
    USDC: 'https://api.bitget.com/api/mix/v1/market/contracts?productType=cmcbl'
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly dbService: DbService,
  ) {}

  async syncListings() {
    try {
      this.logger.log('Syncing Bitget listings...');
      await Promise.all([
        this.syncPairType('USDT'),
        this.syncPairType('USDC')
      ]);
      this.logger.log('Bitget listings sync completed');
    } catch (error) {
      this.logger.error('Failed to sync Bitget listings', error.stack);
    }
  }

  private async syncPairType(quoteAsset: 'USDT' | 'USDC') {
    const url = this.endpoints[quoteAsset];
    const productType = quoteAsset === 'USDT' ? 'umcbl' : 'cmcbl';

    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: BitgetContract[] }>(url)
      );

      for (const contract of response.data.data) {
        await this.upsertListing({
          symbol: contract.symbol.split('_')[0], // Remove suffix
          baseAsset: contract.baseCoin,
          quoteAsset: contract.quoteCoin,
          productType,
          status: contract.symbolStatus === 'normal'
        });
      }
    } catch (error) {
      this.logger.error(`Failed to sync ${quoteAsset} pairs`, error.message);
      throw error;
    }
  }

  private async upsertListing(data: {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    productType: string;
    status: boolean;
  }) {
    const db = this.dbService.getDb();
    const existing = await db.query.bitgetListings.findFirst({
      where: eq(bitgetListings.symbol, data.symbol)
    });

    if (existing) {
      await db.update(bitgetListings)
        .set({
          status: data.status,
          updatedAt: new Date()
        })
        .where(eq(bitgetListings.id, existing.id));
    } else {
      await db.insert(bitgetListings).values(data);
    }
  }

  async getActivePairs(quoteAsset?: string) {
    const db = this.dbService.getDb();
    return db.query.bitgetListings.findMany({
      where: quoteAsset 
        ? and(
            eq(bitgetListings.quoteAsset, quoteAsset),
            eq(bitgetListings.status, true))
        : eq(bitgetListings.status, true)
    });
  }
}