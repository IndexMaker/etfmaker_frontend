import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexController } from './api/index.controller';
import { DailyFetchJob } from './cron/daily-fetch.job';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { DataFetcherModule } from './modules/data-fetcher/data-fetcher.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { ComputationModule } from './modules/computation/computation.module';
import { StorageModule } from './modules/storatge/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'redis',
      port: 6379,
    }),
    DataFetcherModule,
    BlockchainModule,
    ComputationModule,
    StorageModule,
  ],
  controllers: [IndexController],
  providers: [DailyFetchJob],
})
export class AppModule {}