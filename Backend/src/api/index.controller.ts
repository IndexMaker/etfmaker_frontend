import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IndexRegistryService } from 'src/modules/blockchain/index-registry.service';
import { EtfPriceService } from 'src/modules/computation/etf-price.service';
import { MetricsService } from 'src/modules/computation/metrics.service';
import { EtfMainService } from 'src/modules/computation/etf-main.service';
import { BinanceService } from 'src/modules/data-fetcher/binance.service';
import { Response } from 'express';
import { CoinGeckoService } from 'src/modules/data-fetcher/coingecko.service';
import { HuggingFaceService } from 'src/modules/computation/huggingface.service';

@ApiTags('indices')
@Controller('indices')
export class IndexController {
  constructor(
    private binanceService: BinanceService,
    private etfPriceService: EtfPriceService,
    private metricsService: MetricsService,
    private etfMainService: EtfMainService,
    private coinGeckoService: CoinGeckoService,
    private indexRegistryService: IndexRegistryService,
    private huggingfaceService: HuggingFaceService
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

  @Get('/parsingAnnouncements')
  async processAnnouncements() {
    await this.huggingfaceService.processAnnouncements()
  }

  @ApiOperation({ summary: 'Trigger Top 100 rebalance' })
  @Get('/rebalance')
  async rebalance(@Param('indexId') indexId: number): Promise<void> {
    // initial deploying
    await this.etfMainService.processAllPendingRebalances()

    // await this.coinGeckoService.storeMissingPricesUntilToday();
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(21);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(22);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(23);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(24);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(25);
    // await this.etfPriceService.getHistoricalDataFromTempRebalances(27);
    // SY100: Biweekly from 2022-01-01
    let sy100Start = new Date('2019-01-01');
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    // while (sy100Start < now) {
    //   console.log(`Simulating SY100 rebalance at ${sy100Start.toISOString()}`);
    //   await this.etfMainService.rebalanceSY100(21, Math.floor(sy100Start.getTime() / 1000));
    //   sy100Start.setDate(sy100Start.getDate() + 14); // biweekly
    // }

    // SYAZ: Daily from 2019-01-01
    let syazStart = new Date('2019-01-01');
    // while (syazStart < now) {
    //   console.log(`Simulating SYAZ rebalance at ${syazStart.toISOString()}`);
    //   await this.etfMainService.rebalanceETF('andreessen-horowitz-a16z-portfolio', 22, Math.floor(syazStart.getTime() / 1000));
    //   syazStart.setDate(syazStart.getDate() + 1); // daily
    // }

    // await this.etfMainService.simulateRebalances(syazStart, now, 'andreessen-horowitz-a16z-portfolio', 22);

    // SYL2: Daily from 2019-01-01
    let syl2Start = new Date('2019-01-01');
    // while (syl2Start < now) {
    //   console.log(`Simulating SYL2 rebalance at ${syl2Start.toISOString()}`);
    //   await this.etfMainService.rebalanceETF('layer-2', 23, Math.floor(syl2Start.getTime() / 1000));
    //   syl2Start.setDate(syl2Start.getDate() + 1); // daily
    // }
    // await this.etfMainService.simulateRebalances(syl2Start, now, 'layer-2', 23);

    // SYAI: Daily from 2019-01-01
    let syaiStart = new Date('2019-01-01');
    // while (syaiStart < now) {
    //   console.log(`Simulating SYAI rebalance at ${syaiStart.toISOString()}`);
    //   await this.etfMainService.rebalanceETF('artificial-intelligence', 24, Math.floor(syaiStart.getTime() / 1000));
    //   syaiStart.setDate(syaiStart.getDate() + 1); // daily
    // }

    // await this.etfMainService.simulateRebalances(syaiStart, now, 'artificial-intelligence', 24);

    // SYME: Daily from 2019-01-01
    let symeStart = new Date('2019-01-01');
    // while (symeStart < now) {
    //   console.log(`Simulating SYME rebalance at ${symeStart.toISOString()}`);
    //   await this.etfMainService.rebalanceETF('meme-token', 25, Math.floor(symeStart.getTime() / 1000));
    //   symeStart.setDate(symeStart.getDate() + 1); // daily
    // }

    // await this.etfMainService.simulateRebalances(symeStart, now, 'meme-token', 25);
    // SYDF: Daily from 2019-01-01
    let sydfStart = new Date('2019-01-01');
    // while (sydfStart < now) {
    //   console.log(`Simulating SYDF rebalance at ${sydfStart.toISOString()}`);
    // await this.etfMainService.rebalanceETF('decentralized-finance-defi', 26, Math.floor(now.getTime() / 1000));
    //   sydfStart.setDate(sydfStart.getDate() + 1); // daily
    // }
    // await this.etfMainService.simulateRebalances(
    //   sydfStart,
    //   now,
    //   'decentralized-finance-defi',
    //   27,
    // );
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
    const formattedTransactions =
      await this.etfPriceService.getIndexTransactions(indexId);
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
      formattedTransactions,
    };

    return response;
  }

  @Get('/getCalculatedRebalances/:indexId')
  @ApiOperation({ summary: 'Get rebalance data for a specific index' })
  async getRebalances(@Param('indexId') indexId: number) {
    if (indexId) {
      return this.etfMainService.getRebalancesByIndex(indexId);
    }
    else{
      return []
    }
  }

  @Get('/fetchCurrentRebalanceById/:indexId')
  @ApiOperation({ summary: 'Get rebalance data for a specific index' })
  async fetchCurrentRebalanceById(@Param('indexId') indexId: number) {
    if (indexId) {
      return this.etfMainService.getCurrentRebalanceById(indexId);
    }
    else{
      return []
    }
  }

  @Get('/downloadRebalanceData/:indexId')
  async downloadRebalanceData(
    @Param('indexId') indexId: number,
    @Res() res: Response,
  ) {
    // const rebalanceData = await this.etfPriceService.getRebalancedData(indexId);

    // // Prepare CSV headers
    // const headers = ['Timestamp', 'Date', 'Price', 'Weights'];

    // // Convert data to CSV rows
    // const csvRows: any[] = [];

    // // Add header row
    // csvRows.push(headers.join(','));

    // // Add data rows
    // rebalanceData.forEach((event) => {
    //   const date = new Date(event.timestamp * 1000).toISOString();
    //   const weightsString = JSON.stringify(event.weights).replace(/"/g, '""');

    //   const row = [
    //     event.timestamp,
    //     `"${date}"`,
    //     event.price,
    //     `"${weightsString}"`,
    //   ];

    //   csvRows.push(row.join(','));
    // });

    // // Create CSV string
    // const csvString = csvRows.join('\n');

    // res.setHeader('Content-Type', 'text/csv');
    // res.setHeader(
    //   'Content-Disposition',
    //   `attachment; filename="rebalance_data_${indexId}.csv"`,
    // );

    // // Send CSV data
    // res.send(csvString);

    const _rebalanceData = [
      {
        "id": 31,
        "ticker": "BTC",
        "listing": "bi",
        "assetname": "Bitcoin",
        "sector": "Smart Contract Platform",
        "market_cap": 2068844610711,
        "weights": "1.00"
      },
      {
        "id": 44,
        "ticker": "ETH",
        "listing": "bi",
        "assetname": "Ethereum",
        "sector": "Smart Contract Platform",
        "market_cap": 300875677658,
        "weights": "1.00"
      },
      {
        "id": 27,
        "ticker": "XRP",
        "listing": "bi",
        "assetname": "XRP",
        "sector": "FTX Holdings",
        "market_cap": 127409982679,
        "weights": "1.00"
      },
      {
        "id": 66,
        "ticker": "BNB",
        "listing": "bi",
        "assetname": "BNB",
        "sector": "Smart Contract Platform",
        "market_cap": 93401459004,
        "weights": "1.00"
      },
      {
        "id": 28,
        "ticker": "SOL",
        "listing": "bi",
        "assetname": "Solana",
        "sector": "Smart Contract Platform",
        "market_cap": 75778150655,
        "weights": "1.00"
      },
      {
        "id": 14,
        "ticker": "TRX",
        "listing": "bi",
        "assetname": "TRON",
        "sector": "Smart Contract Platform",
        "market_cap": 25934445399,
        "weights": "1.00"
      },
      {
        "id": 43,
        "ticker": "DOGE",
        "listing": "bi",
        "assetname": "Dogecoin",
        "sector": "Smart Contract Platform",
        "market_cap": 25256825930,
        "weights": "1.00"
      },
      {
        "id": 78,
        "ticker": "STETH",
        "listing": "bg",
        "assetname": "Lido Staked Ether",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 22747265997,
        "weights": "1.00"
      },
      {
        "id": 32,
        "ticker": "ADA",
        "listing": "bi",
        "assetname": "Cardano",
        "sector": "Smart Contract Platform",
        "market_cap": 21378028503,
        "weights": "1.00"
      },
      {
        "id": 67,
        "ticker": "HYPE",
        "listing": "bi",
        "assetname": "Hyperliquid",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 12090128490,
        "weights": "1.00"
      },
      {
        "id": 72,
        "ticker": "BCH",
        "listing": "bi",
        "assetname": "Bitcoin Cash",
        "sector": "Smart Contract Platform",
        "market_cap": 9643422924,
        "weights": "1.00"
      },
      {
        "id": 3,
        "ticker": "SUI",
        "listing": "bi",
        "assetname": "Sui",
        "sector": "Smart Contract Platform",
        "market_cap": 9529933610,
        "weights": "1.00"
      },
      {
        "id": 54,
        "ticker": "LINK",
        "listing": "bi",
        "assetname": "Chainlink",
        "sector": "Business Services",
        "market_cap": 8523507104,
        "weights": "1.00"
      },
      {
        "id": 36,
        "ticker": "XLM",
        "listing": "bi",
        "assetname": "Stellar",
        "sector": "Smart Contract Platform",
        "market_cap": 7741277784,
        "weights": "1.00"
      },
      {
        "id": 64,
        "ticker": "AVAX",
        "listing": "bi",
        "assetname": "Avalanche",
        "sector": "Smart Contract Platform",
        "market_cap": 7460988605,
        "weights": "1.00"
      },
      {
        "id": 90,
        "ticker": "TON",
        "listing": "bi",
        "assetname": "Toncoin",
        "sector": "Smart Contract Platform",
        "market_cap": 7240744257,
        "weights": "1.00"
      },
      {
        "id": 56,
        "ticker": "SHIB",
        "listing": "bi",
        "assetname": "Shiba Inu",
        "sector": "Meme",
        "market_cap": 6761460143,
        "weights": "1.00"
      },
      {
        "id": 49,
        "ticker": "LTC",
        "listing": "bi",
        "assetname": "Litecoin",
        "sector": "Smart Contract Platform",
        "market_cap": 6425561631,
        "weights": "1.00"
      },
      {
        "id": 89,
        "ticker": "HBAR",
        "listing": "bi",
        "assetname": "Hedera",
        "sector": "Smart Contract Platform",
        "market_cap": 6135810012,
        "weights": "1.00"
      },
      {
        "id": 51,
        "ticker": "DOT",
        "listing": "bi",
        "assetname": "Polkadot",
        "sector": "Smart Contract Platform",
        "market_cap": 5352720914,
        "weights": "1.00"
      },
      {
        "id": 73,
        "ticker": "BGB",
        "listing": "bg",
        "assetname": "Bitget Token",
        "sector": "Exchange-based Tokens",
        "market_cap": 4968957800,
        "weights": "1.00"
      },
      {
        "id": 38,
        "ticker": "UNI",
        "listing": "bi",
        "assetname": "Uniswap",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 4514811489,
        "weights": "1.00"
      },
      {
        "id": 13,
        "ticker": "PEPE",
        "listing": "bi",
        "assetname": "Pepe",
        "sector": "BNB Chain Ecosystem",
        "market_cap": 4292471966,
        "weights": "1.00"
      },
      {
        "id": 63,
        "ticker": "PI",
        "listing": "bg",
        "assetname": "Pi Network",
        "sector": "Layer 1 (L1)",
        "market_cap": 3938498510,
        "weights": "1.00"
      },
      {
        "id": 4,
        "ticker": "AAVE",
        "listing": "bi",
        "assetname": "Aave",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 3790828391,
        "weights": "1.00"
      },
      {
        "id": 53,
        "ticker": "TAO",
        "listing": "bi",
        "assetname": "Bittensor",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 3068530509,
        "weights": "1.00"
      },
      {
        "id": 87,
        "ticker": "CRO",
        "listing": "bg",
        "assetname": "Cronos",
        "sector": "Smart Contract Platform",
        "market_cap": 2814569500,
        "weights": "1.00"
      },
      {
        "id": 15,
        "ticker": "APT",
        "listing": "bi",
        "assetname": "Aptos",
        "sector": "Smart Contract Platform",
        "market_cap": 2784134803,
        "weights": "1.00"
      },
      {
        "id": 93,
        "ticker": "ICP",
        "listing": "bi",
        "assetname": "Internet Computer",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 2666409144,
        "weights": "1.00"
      },
      {
        "id": 11,
        "ticker": "NEAR",
        "listing": "bi",
        "assetname": "NEAR Protocol",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 2647348482,
        "weights": "1.00"
      },
      {
        "id": 88,
        "ticker": "ETC",
        "listing": "bi",
        "assetname": "Ethereum Classic",
        "sector": "Smart Contract Platform",
        "market_cap": 2508705270,
        "weights": "1.00"
      },
      {
        "id": 75,
        "ticker": "ONDO",
        "listing": "bi",
        "assetname": "Ondo",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 2400798148,
        "weights": "1.00"
      },
      {
        "id": 82,
        "ticker": "TRUMP",
        "listing": "bi",
        "assetname": "Official Trump",
        "sector": "Solana Ecosystem",
        "market_cap": 1850234155,
        "weights": "1.00"
      },
      {
        "id": 39,
        "ticker": "VET",
        "listing": "bi",
        "assetname": "VeChain",
        "sector": "Internet of Things (IOT)",
        "market_cap": 1831179002,
        "weights": "1.00"
      },
      {
        "id": 18,
        "ticker": "KAS",
        "listing": "bi",
        "assetname": "Kaspa",
        "sector": "Smart Contract Platform",
        "market_cap": 1824811766,
        "weights": "1.00"
      },
      {
        "id": 22,
        "ticker": "ATOM",
        "listing": "bg",
        "assetname": "Cosmos Hub",
        "sector": "Smart Contract Platform",
        "market_cap": 1810217522,
        "weights": "1.00"
      },
      {
        "id": 46,
        "ticker": "FET",
        "listing": "bi",
        "assetname": "Artificial Superintelligence Alliance",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 1756267707,
        "weights": "1.00"
      },
      {
        "id": 23,
        "ticker": "ENA",
        "listing": "bi",
        "assetname": "Ethena",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 1707063009,
        "weights": "1.00"
      },
      {
        "id": 2,
        "ticker": "SKY",
        "listing": "bg",
        "assetname": "Sky",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 1704304464,
        "weights": "1.00"
      },
      {
        "id": 99,
        "ticker": "POL",
        "listing": "bi",
        "assetname": "POL (ex-MATIC)",
        "sector": "Smart Contract Platform",
        "market_cap": 1667776708,
        "weights": "1.00"
      },
      {
        "id": 77,
        "ticker": "RENDER",
        "listing": "bi",
        "assetname": "Render",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 1646910031,
        "weights": "1.00"
      },
      {
        "id": 47,
        "ticker": "FIL",
        "listing": "bi",
        "assetname": "Filecoin",
        "sector": "Infrastructure",
        "market_cap": 1575833930,
        "weights": "1.00"
      },
      {
        "id": 80,
        "ticker": "WLD",
        "listing": "bi",
        "assetname": "Worldcoin",
        "sector": "Smart Contract Platform",
        "market_cap": 1512622337,
        "weights": "1.00"
      },
      {
        "id": 41,
        "ticker": "ARB",
        "listing": "bi",
        "assetname": "Arbitrum",
        "sector": "Smart Contract Platform",
        "market_cap": 1476472289,
        "weights": "1.00"
      },
      {
        "id": 40,
        "ticker": "ALGO",
        "listing": "bg",
        "assetname": "Algorand",
        "sector": "Smart Contract Platform",
        "market_cap": 1450604039,
        "weights": "1.00"
      },
      {
        "id": 79,
        "ticker": "QNT",
        "listing": "bi",
        "assetname": "Quant",
        "sector": "Ethereum Ecosystem",
        "market_cap": 1426348335,
        "weights": "1.00"
      },
      {
        "id": 12,
        "ticker": "NEXO",
        "listing": "bg",
        "assetname": "NEXO",
        "sector": "Polygon Ecosystem",
        "market_cap": 1208377799,
        "weights": "1.00"
      },
      {
        "id": 98,
        "ticker": "JUP",
        "listing": "bi",
        "assetname": "Jupiter",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 1177078268,
        "weights": "1.00"
      },
      {
        "id": 42,
        "ticker": "TIA",
        "listing": "bi",
        "assetname": "Celestia",
        "sector": "Smart Contract Platform",
        "market_cap": 1099225919,
        "weights": "1.00"
      },
      {
        "id": 95,
        "ticker": "INJ",
        "listing": "bi",
        "assetname": "Injective",
        "sector": "Smart Contract Platform",
        "market_cap": 1096112784,
        "weights": "1.00"
      },
      {
        "id": 91,
        "ticker": "VIRTUAL",
        "listing": "bi",
        "assetname": "Virtuals Protocol",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 1083225735,
        "weights": "1.00"
      },
      {
        "id": 5,
        "ticker": "BONK",
        "listing": "bi",
        "assetname": "Bonk",
        "sector": "BNB Chain Ecosystem",
        "market_cap": 1080074796,
        "weights": "1.00"
      },
      {
        "id": 69,
        "ticker": "SEI",
        "listing": "bi",
        "assetname": "Sei",
        "sector": "Smart Contract Platform",
        "market_cap": 1036113463,
        "weights": "1.00"
      },
      {
        "id": 45,
        "ticker": "FARTCOIN",
        "listing": "bi",
        "assetname": "Fartcoin",
        "sector": "Solana Ecosystem",
        "market_cap": 1017470720,
        "weights": "1.00"
      },
      {
        "id": 9,
        "ticker": "KAIA",
        "listing": "bi",
        "assetname": "Kaia",
        "sector": "Smart Contract Platform",
        "market_cap": 1015082272,
        "weights": "1.00"
      },
      {
        "id": 35,
        "ticker": "S",
        "listing": "bi",
        "assetname": "Sonic",
        "sector": "Smart Contract Platform",
        "market_cap": 1009240369,
        "weights": "1.00"
      },
      {
        "id": 50,
        "ticker": "OP",
        "listing": "bi",
        "assetname": "Optimism",
        "sector": "Smart Contract Platform",
        "market_cap": 956779707,
        "weights": "1.00"
      },
      {
        "id": 86,
        "ticker": "XDC",
        "listing": "bg",
        "assetname": "XDC Network",
        "sector": "Smart Contract Platform",
        "market_cap": 930849448,
        "weights": "1.00"
      },
      {
        "id": 60,
        "ticker": "STX",
        "listing": "bi",
        "assetname": "Stacks",
        "sector": "Infrastructure",
        "market_cap": 929718555,
        "weights": "1.00"
      },
      {
        "id": 81,
        "ticker": "AB",
        "listing": "bg",
        "assetname": "AB",
        "sector": "BNB Chain Ecosystem",
        "market_cap": 914247943,
        "weights": "1.00"
      },
      {
        "id": 57,
        "ticker": "GRT",
        "listing": "bi",
        "assetname": "The Graph",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 813648256,
        "weights": "1.00"
      },
      {
        "id": 29,
        "ticker": "A",
        "listing": "bi",
        "assetname": "Vaulta",
        "sector": "Layer 1 (L1)",
        "market_cap": 789859178,
        "weights": "1.00"
      },
      {
        "id": 85,
        "ticker": "CRV",
        "listing": "bi",
        "assetname": "Curve DAO",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 788520085,
        "weights": "1.00"
      },
      {
        "id": 61,
        "ticker": "WIF",
        "listing": "bi",
        "assetname": "dogwifhat",
        "sector": "Solana Ecosystem",
        "market_cap": 776997762,
        "weights": "1.00"
      },
      {
        "id": 97,
        "ticker": "JTO",
        "listing": "bi",
        "assetname": "Jito",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 770242963,
        "weights": "1.00"
      },
      {
        "id": 68,
        "ticker": "IMX",
        "listing": "bi",
        "assetname": "Immutable",
        "sector": "Smart Contract Platform",
        "market_cap": 751488351,
        "weights": "1.00"
      },
      {
        "id": 92,
        "ticker": "AERO",
        "listing": "bi",
        "assetname": "Aerodrome Finance",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 743197190,
        "weights": "1.00"
      },
      {
        "id": 37,
        "ticker": "IP",
        "listing": "bi",
        "assetname": "Story",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 729784144,
        "weights": "1.00"
      },
      {
        "id": 16,
        "ticker": "FLOKI",
        "listing": "bi",
        "assetname": "FLOKI",
        "sector": "Gaming (GameFi)",
        "market_cap": 707900498,
        "weights": "1.00"
      },
      {
        "id": 94,
        "ticker": "CAKE",
        "listing": "bi",
        "assetname": "PancakeSwap",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 701769586,
        "weights": "1.00"
      },
      {
        "id": 48,
        "ticker": "LDO",
        "listing": "bi",
        "assetname": "Lido DAO",
        "sector": "Infrastructure",
        "market_cap": 684238206,
        "weights": "1.00"
      },
      {
        "id": 71,
        "ticker": "THETA",
        "listing": "bi",
        "assetname": "Theta Network",
        "sector": "Smart Contract Platform",
        "market_cap": 669565103,
        "weights": "1.00"
      },
      {
        "id": 21,
        "ticker": "ZEC",
        "listing": "bi",
        "assetname": "Zcash",
        "sector": "Smart Contract Platform",
        "market_cap": 663639827,
        "weights": "1.00"
      },
      {
        "id": 96,
        "ticker": "ENS",
        "listing": "bi",
        "assetname": "Ethereum Name Service",
        "sector": "NFT",
        "market_cap": 646337806,
        "weights": "1.00"
      },
      {
        "id": 7,
        "ticker": "GALA",
        "listing": "bi",
        "assetname": "GALA",
        "sector": "Smart Contract Platform",
        "market_cap": 632838821,
        "weights": "1.00"
      },
      {
        "id": 59,
        "ticker": "BTT",
        "listing": "bi",
        "assetname": "BitTorrent",
        "sector": "Storage",
        "market_cap": 623899953,
        "weights": "1.00"
      },
      {
        "id": 8,
        "ticker": "IOTA",
        "listing": "bi",
        "assetname": "IOTA",
        "sector": "Internet of Things (IOT)",
        "market_cap": 619702868,
        "weights": "1.00"
      },
      {
        "id": 84,
        "ticker": "BSV",
        "listing": "bi",
        "assetname": "Bitcoin SV",
        "sector": "Smart Contract Platform",
        "market_cap": 617878370,
        "weights": "1.00"
      },
      {
        "id": 70,
        "ticker": "SAND",
        "listing": "bi",
        "assetname": "The Sandbox",
        "sector": "Gaming (GameFi)",
        "market_cap": 612355495,
        "weights": "1.00"
      },
      {
        "id": 26,
        "ticker": "PENDLE",
        "listing": "bi",
        "assetname": "Pendle",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 608766334,
        "weights": "1.00"
      },
      {
        "id": 55,
        "ticker": "JASMY",
        "listing": "bi",
        "assetname": "JasmyCoin",
        "sector": "Internet of Things (IOT)",
        "market_cap": 604547459,
        "weights": "1.00"
      },
      {
        "id": 34,
        "ticker": "RAY",
        "listing": "bi",
        "assetname": "Raydium",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 581389763,
        "weights": "1.00"
      },
      {
        "id": 52,
        "ticker": "WAL",
        "listing": "bi",
        "assetname": "Walrus",
        "sector": "Infrastructure",
        "market_cap": 580014827,
        "weights": "1.00"
      },
      {
        "id": 83,
        "ticker": "PENGU",
        "listing": "bi",
        "assetname": "Pudgy Penguins",
        "sector": "Solana Ecosystem",
        "market_cap": 577607023,
        "weights": "1.00"
      },
      {
        "id": 76,
        "ticker": "PYTH",
        "listing": "bi",
        "assetname": "Pyth Network",
        "sector": "Business Services",
        "market_cap": 552142012,
        "weights": "1.00"
      },
      {
        "id": 20,
        "ticker": "XTZ",
        "listing": "bi",
        "assetname": "Tezos",
        "sector": "Smart Contract Platform",
        "market_cap": 550970153,
        "weights": "1.00"
      },
      {
        "id": 6,
        "ticker": "FLOW",
        "listing": "bi",
        "assetname": "Flow",
        "sector": "Smart Contract Platform",
        "market_cap": 541143510,
        "weights": "1.00"
      },
      {
        "id": 19,
        "ticker": "SYRUP",
        "listing": "bi",
        "assetname": "Maple Finance",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 523793164,
        "weights": "1.00"
      },
      {
        "id": 30,
        "ticker": "APE",
        "listing": "bi",
        "assetname": "ApeCoin",
        "sector": "Gaming (GameFi)",
        "market_cap": 501306882,
        "weights": "1.00"
      },
      {
        "id": 58,
        "ticker": "RUNE",
        "listing": "bi",
        "assetname": "THORChain",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 490626048,
        "weights": "1.00"
      },
      {
        "id": 74,
        "ticker": "MANA",
        "listing": "bi",
        "assetname": "Decentraland",
        "sector": "Entertainment",
        "market_cap": 480092400,
        "weights": "1.00"
      },
      {
        "id": 33,
        "ticker": "XCN",
        "listing": "bi",
        "assetname": "Onyxcoin",
        "sector": "Smart Contract Platform",
        "market_cap": 460462069,
        "weights": "1.00"
      },
      {
        "id": 100,
        "ticker": "COMP",
        "listing": "bi",
        "assetname": "Compound",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 454231229,
        "weights": "1.00"
      },
      {
        "id": 10,
        "ticker": "KAVA",
        "listing": "bi",
        "assetname": "Kava",
        "sector": "Smart Contract Platform",
        "market_cap": 439160614,
        "weights": "1.00"
      },
      {
        "id": 24,
        "ticker": "HNT",
        "listing": "bg",
        "assetname": "Helium",
        "sector": "Communication",
        "market_cap": 425069653,
        "weights": "1.00"
      },
      {
        "id": 65,
        "ticker": "BRETT",
        "listing": "bi",
        "assetname": "Brett",
        "sector": "Meme",
        "market_cap": 412140806,
        "weights": "1.00"
      },
      {
        "id": 25,
        "ticker": "MORPHO",
        "listing": "bi",
        "assetname": "Morpho",
        "sector": "Decentralized Finance (DeFi)",
        "market_cap": 403441152,
        "weights": "1.00"
      },
      {
        "id": 62,
        "ticker": "DYDX",
        "listing": "bi",
        "assetname": "dYdX",
        "sector": "Decentralized Exchange (DEX)",
        "market_cap": 395242477,
        "weights": "1.00"
      },
      {
        "id": 17,
        "ticker": "GRASS",
        "listing": "bi",
        "assetname": "Grass",
        "sector": "Artificial Intelligence (AI)",
        "market_cap": 392969710,
        "weights": "1.00"
      },
      {
        "id": 1,
        "ticker": "NEO",
        "listing": "bi",
        "assetname": "NEO",
        "sector": "Smart Contract Platform",
        "market_cap": 387671985,
        "weights": "1.00"
      }
    ] 

    const sortedData = [..._rebalanceData].sort((a, b) => b.market_cap - a.market_cap);
  
  // 2. Map to new structure with rank and listing conversion
  console.log(sortedData.map((item, index) => ({
    id: index + 1,
    ticker: item.assetname,
    listing: item.listing === 'bi' ? 'Binance' : 'Bitget',
    sector: item.sector,
    weights: item.weights,
    market_cap: item.market_cap
  })))
  return sortedData.map((item, index) => ({
    id: index + 1,
    ticker: item.assetname,
    listing: item.listing === 'bi' ? 'Binance' : 'Bitget',
    sector: item.sector,
    weights: item.weights,
    market_cap: item.market_cap
  }));

    const rebalanceData =
      await this.etfPriceService.getTempRebalancedData(indexId);

    // Prepare CSV headers
    const headers = [
      'Index',
      'IndexId',
      'Rebalance Date',
      'Index Price',
      'Weights',
      // 'QUantities',
      'Asset Prices',
    ];

    // Convert data to CSV rows
    const csvRows: any[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    rebalanceData.forEach((event) => {
      const date = event.date;
      const weightsString = JSON.stringify(event.weights)
        .replace(/"/g, '')
        .replace(/\\/g, '');
      const pricesString = JSON.stringify(event.assetPrices)
        .replace(/"/g, '')
        .replace(/\\/g, '');
      const row = [
        event.index,
        event.indexId,
        date,
        event.indexPrice,
        `"${weightsString}"`,
        // `"${quantitiesString}"`,
        `"${pricesString}"`,
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

  @Get('/downloadDailyPriceData/:indexId')
  async downloadDailyPriceData(
    @Param('indexId') indexId: number,
    @Res() res: Response,
  ) {
    const dailyPriceData =
      await this.etfPriceService.getDailyPriceData(indexId);

    // Prepare CSV headers
    const headers = [
      'Index',
      'IndexId',
      'Date',
      'Price',
      'Asset Quantities',
      'Asset Prices',
    ];

    // Convert data to CSV rows
    const csvRows: any[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    dailyPriceData.forEach((event) => {
      const date = event.date;
      const quantities = JSON.stringify(event.quantities)
        .replace(/"/g, '')
        .replace(/\\/g, '');

      const coinPrices = JSON.stringify(event.coinPrices)
        .replace(/"/g, '')
        .replace(/\\/g, '');
      const price = event.price || 0;
      const row = [
        event.index,
        event.indexId,
        date,
        price,
        `"${quantities}"`,
        `"${coinPrices}"`,
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
    const btcData =
      await this.etfPriceService.fetchCoinHistoricalData('bitcoin');
    return btcData;
  }

  @Get('/fetchEthHistoricalData')
  async fetchEthHistoricalData(): Promise<any> {
    const ethData =
      await this.etfPriceService.fetchCoinHistoricalData('ethereum');
    return ethData;
  }

  @Get('/fetchVaultAssets/:indexId')
  async fetchVaultAssets(@Param('indexId') indexId: number): Promise<any> {
    const ethData = await this.etfPriceService.fetchVaultAssets(indexId);
    return ethData;
  }

  @Get('/getIndexLists')
  async fetchIndexLists() {
    const lists = await this.etfPriceService.getIndexList();
    return lists;
  }
}
