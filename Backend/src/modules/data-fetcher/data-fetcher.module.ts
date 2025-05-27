import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinGeckoService } from './coingecko.service';
import { CoinMarketCapService } from './coinmarketcap.service';
import { BinanceService } from './binance.service';
import { DbService } from 'src/db/db.service';
import { BitgetService } from './bitget.service';

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoService, CoinMarketCapService, BinanceService, DbService, BitgetService],
  exports: [CoinGeckoService, CoinMarketCapService, BinanceService, DbService, BitgetService],
})
export class DataFetcherModule {}