import { Module, forwardRef } from '@nestjs/common';
import { EtfPriceService } from './etf-price.service';
import { MetricsService } from './metrics.service';
import { EtfMainService } from './etf-main.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DataFetcherModule } from '../data-fetcher/data-fetcher.module';
import { DbService } from '../../db/db.service';
import { HuggingFaceService } from './huggingface.service';
import { ScraperService } from '../scraper/scraperService';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    forwardRef(() => BlockchainModule),
    forwardRef(() => DataFetcherModule),
    HttpModule.register({}),
  ],
  providers: [
    EtfPriceService,
    MetricsService,
    EtfMainService,
    DbService,
    HuggingFaceService,
    ScraperService,
  ],
  exports: [
    EtfPriceService,
    MetricsService,
    EtfMainService,
    HuggingFaceService,
    DbService,
    ScraperService,
  ],
})
export class ComputationModule {}
