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
  @Get('/rebalance')
  async rebalance(@Param('indexId') indexId: number): Promise<void> {
    // SY100: Biweekly from 2022-01-01
    // let sy100Start = new Date('2019-01-01');
    // const now = new Date();

    // while (sy100Start < now) {
    //   console.log(`Simulating SY100 rebalance at ${sy100Start.toISOString()}`);
    //   await this.top100Service.rebalanceSY100(6, Math.floor(sy100Start.getTime() / 1000));
    //   sy100Start.setDate(sy100Start.getDate() + 14); // biweekly
    // }
    // let syazStart = new Date('2019-01-01');

    // while (syazStart < now) {
    //   console.log(`Simulating SYAZ rebalance at ${syazStart.toISOString()}`);
    //   await this.top100Service.rebalanceSYAZ(7, Math.floor(syazStart.getTime() / 1000));
    //   syazStart.setDate(syazStart.getDate() + 1); // daily
    // }
  }

  @ApiOperation({ summary: 'Get index data' })
  @Get(':indexId/data')
  async getIndexData(@Param('indexId') indexId: number): Promise<any> {
    return this.indexRegistryService.getIndexData(indexId);
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

  @Get('/getHistoricalData')
  async getHistoricalData() {
    const indexIds = [6, 7]; // Or dynamically load this list if needed
    const allData: any[] = [];

    for (const indexId of indexIds) {
      const rawData = await this.etfPriceService.getHistoricalData(indexId);

      // Calculate cumulative returns
      let baseValue = 10000;
      let indexName = '';
      const chartData = rawData.map((entry, index) => {
        indexName =  entry.name
        if (index === 0)
          return {
            name: entry.name,
            date: entry.date,
            price: entry.price,
            value: baseValue,
          };

        const prevPrice = rawData[index - 1].price;
        const returnPct = (entry.price - prevPrice) / prevPrice;
        baseValue = baseValue * (1 + returnPct);

        return {
          date: entry.date,
          price: entry.price,
          value: baseValue,
        };
      });

      allData.push({
        name: indexName,
        indexId,
        rawData,
        chartData,
      });
    }

    return allData;
  }

  @Get('/fetchBtcHistoricalData')
  async fetchBtcHistoricalData(): Promise<any> {
    const btcData = await this.etfPriceService.fetchCoinHistoricalData();
    return btcData;
  }

  @Get('/getIndexLists')
  async fetchIndexLists() {
    const lists = await this.etfPriceService.getIndexList()
    return lists
  }
}
