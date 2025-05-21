import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';
import { EtfPriceService } from 'src/modules/computation/etf-price.service';
import { MetricsService } from 'src/modules/computation/metrics.service';
import { Top100Service } from 'src/modules/computation/top100.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';
import { Response } from 'express';

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
    // let sy100Start = new Date('2022-02-07');
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    // while (sy100Start < now) {
    //   console.log(`Simulating SY100 rebalance at ${sy100Start.toISOString()}`);
    //   await this.top100Service.rebalanceSY100(21, Math.floor(sy100Start.getTime() / 1000));
    //   sy100Start.setDate(sy100Start.getDate() + 14); // biweekly
    // }
    
    // // SYAZ: Daily from 2019-01-01
    // let syazStart = new Date('2019-01-01');
    // // while (syazStart < now) {
    // //   console.log(`Simulating SYAZ rebalance at ${syazStart.toISOString()}`);
    // //   await this.top100Service.rebalanceETF('andreessen-horowitz-a16z-portfolio', 22, Math.floor(syazStart.getTime() / 1000));
    // //   syazStart.setDate(syazStart.getDate() + 1); // daily
    // // }

    // await this.top100Service.simulateRebalances(syazStart, now, 'andreessen-horowitz-a16z-portfolio', 22);

    // // SYL2: Daily from 2019-01-01
    // let syl2Start = new Date('2019-01-01');
    // // while (syl2Start < now) {
    // //   console.log(`Simulating SYL2 rebalance at ${syl2Start.toISOString()}`);
    // //   await this.top100Service.rebalanceETF('layer-2', 23, Math.floor(syl2Start.getTime() / 1000));
    // //   syl2Start.setDate(syl2Start.getDate() + 1); // daily
    // // }
    // await this.top100Service.simulateRebalances(syl2Start, now, 'layer-2', 23);

    // // SYAI: Daily from 2019-01-01
    // let syaiStart = new Date('2019-01-01');
    // // while (syaiStart < now) {
    // //   console.log(`Simulating SYAI rebalance at ${syaiStart.toISOString()}`);
    // //   await this.top100Service.rebalanceETF('artificial-intelligence', 24, Math.floor(syaiStart.getTime() / 1000));
    // //   syaiStart.setDate(syaiStart.getDate() + 1); // daily
    // // }

    // await this.top100Service.simulateRebalances(syaiStart, now, 'artificial-intelligence', 24);

    // // SYME: Daily from 2019-01-01
    // let symeStart = new Date('2019-01-01');
    // // while (symeStart < now) {
    // //   console.log(`Simulating SYME rebalance at ${symeStart.toISOString()}`);
    // //   await this.top100Service.rebalanceETF('meme-token', 25, Math.floor(symeStart.getTime() / 1000));
    // //   symeStart.setDate(symeStart.getDate() + 1); // daily
    // // }

    // await this.top100Service.simulateRebalances(symeStart, now, 'meme-token', 25);
    // // SYDF: Daily from 2019-01-01
    // let sydfStart = new Date('2019-01-01');
    // // while (sydfStart < now) {
    // //   console.log(`Simulating SYDF rebalance at ${sydfStart.toISOString()}`);
      // await this.top100Service.rebalanceETF('decentralized-finance-defi', 26, Math.floor(now.getTime() / 1000));
    // //   sydfStart.setDate(sydfStart.getDate() + 1); // daily
    // // }
    // await this.top100Service.simulateRebalances(sydfStart, now, 'decentralized-finance-defi', 26);
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

  @Get('/getHistoricalData/:indexId')
  async getHistoricalData(@Param('indexId') indexId: number) {
    if (!indexId) return {};
    const rawData = await this.etfPriceService.getHistoricalData(indexId);
    const formattedTransactions = await this.etfPriceService.getIndexTransactions(indexId);
    // Calculate cumulative returns
    let baseValue = 10000;
    let indexName = '';
    const chartData = rawData.map((entry, index) => {
      indexName = entry.name;
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
        name: entry.name,
        date: entry.date,
        price: entry.price,
        value: baseValue,
      };
    });

    const response = {
      name: indexName,
      indexId,
      rawData,
      chartData,
      formattedTransactions
    };

    return response;
  }

  @Get('/downloadRebalanceData/:indexId')
  async downloadRebalanceData(
    @Param('indexId') indexId: number,
    @Res() res: Response
  ) {
    const rebalanceData = await this.etfPriceService.getRebalancedData(indexId);

    // Prepare CSV headers
    const headers = ['Timestamp', 'Date', 'Price', 'Weights'];

    // Convert data to CSV rows
    const csvRows: any[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    rebalanceData.forEach((event) => {
      const date = new Date(event.timestamp * 1000).toISOString();
      const weightsString = JSON.stringify(event.weights).replace(/"/g, '""');

      const row = [
        event.timestamp,
        `"${date}"`,
        event.price,
        `"${weightsString}"`,
      ];

      csvRows.push(row.join(','));
    });

    // Create CSV string
    const csvString = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="rebalance_data_${indexId}.csv"`,
    );

    // Send CSV data
    res.send(csvString);
  }

  @Get('/fetchBtcHistoricalData')
  async fetchBtcHistoricalData(): Promise<any> {
    const btcData = await this.etfPriceService.fetchCoinHistoricalData('bitcoin');
    return btcData;
  }

  @Get('/fetchEthHistoricalData')
  async fetchEthHistoricalData(): Promise<any> {
    const ethData = await this.etfPriceService.fetchCoinHistoricalData('ethereum');
    return ethData;
  }

  @Get('/getIndexLists')
  async fetchIndexLists() {
    const lists = await this.etfPriceService.getIndexList();
    return lists;
  }
}
