import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinGeckoService } from './coingecko.service';
import { CoinMarketCapService } from './coinmarketcap.service';
import { BinanceService } from './binance.service';

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoService, CoinMarketCapService, BinanceService],
  exports: [CoinGeckoService, CoinMarketCapService, BinanceService],
})
export class DataFetcherModule {}