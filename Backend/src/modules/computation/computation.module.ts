import { Module } from '@nestjs/common';
import { EtfPriceService } from './etf-price.service';
import { MetricsService } from './metrics.service';
import { Top100Service } from './top100.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DataFetcherModule } from '../data-fetcher/data-fetcher.module';
import { DbService } from '../../db/db.service';

@Module({
  imports: [BlockchainModule, DataFetcherModule],
  providers: [EtfPriceService, MetricsService, Top100Service, DbService],
  exports: [EtfPriceService, MetricsService, Top100Service],
})
export class ComputationModule {}