import { Module } from '@nestjs/common';
import { EtfPriceService } from './etf-price.service';
import { MetricsService } from './metrics.service';
import { EtfMainService } from './etf-main.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DataFetcherModule } from '../data-fetcher/data-fetcher.module';
import { DbService } from '../../db/db.service';

@Module({
  imports: [BlockchainModule, DataFetcherModule],
  providers: [EtfPriceService, MetricsService, EtfMainService, DbService],
  exports: [EtfPriceService, MetricsService, EtfMainService],
})
export class ComputationModule {}