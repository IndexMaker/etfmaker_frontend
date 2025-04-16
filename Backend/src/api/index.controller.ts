import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';
import { EtfPriceService } from 'src/modules/computation/etf-price.service';
import { MetricsService } from 'src/modules/computation/metrics.service';
import { Top100Service } from 'src/modules/computation/top100.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';

@ApiTags('indices')
@Controller('indices')
export class IndexController {
  constructor(
    private binanceService: BinanceService,
    private etfPriceService: EtfPriceService,
    private metricsService: MetricsService,
    private top100Service: Top100Service,
    private indexRegistryService: IndexRegistryService,
  ) {}

  @ApiOperation({ summary: 'Get live ETF price' })
  @Get(':indexId/price')
  async getPrice(@Param('indexId') indexId: string): Promise<number> {
    return this.etfPriceService.computeLivePrice(indexId, 1);
  }

  @ApiOperation({ summary: 'Get Year-to-Date return' })
  @Get(':indexId/ytd')
  async getYTD(@Param('indexId') indexId: string): Promise<number> {
    return this.metricsService.computeYTD(indexId, 1);
  }

  @ApiOperation({ summary: 'Get Sharpe Ratio' })
  @Get(':indexId/sharpe')
  async getSharpe(@Param('indexId') indexId: string): Promise<number> {
    return this.metricsService.computeSharpeRatio(indexId, 1);
  }

  @ApiOperation({ summary: 'Trigger Top 100 rebalance' })
  @Get(':indexId/rebalance')
  async rebalance(@Param('indexId') indexId: string): Promise<void> {
    await this.top100Service.rebalanceTop100(indexId);
  }

  @ApiOperation({ summary: 'Get index data' })
  @Get(':indexId/data')
  async getIndexData(@Param('indexId') indexId: string): Promise<any> {
    // return this.indexRegistryService.getIndexData(indexId, 1);
  }

  @ApiOperation({ summary: 'Detect Binance listings/delistings' })
  @Get('binance/listings')
  async getListings(): Promise<any> {
    return this.binanceService.detectListingsAndDelistings();
  }

  @ApiOperation({ summary: 'Get Binance trading pairs' })
  @Get('binance/pairs')
  async getBinancePairs(): Promise<any> {
    return this.binanceService.fetchTradingPairs();
  }
}
