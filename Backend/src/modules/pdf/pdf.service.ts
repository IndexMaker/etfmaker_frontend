import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { EtfPriceService } from '../computation/etf-price.service';
import { calculateRiskMeasuresAgainstBTC } from 'src/common/utils/riskMeasuresAgainstBTC';

@Injectable()
export class PdfService {
  constructor(
    @Inject(forwardRef(() => EtfPriceService))
    private etfPriceService: EtfPriceService,
  ) {}
  async generatePdfFromHtml(
    template: string,
    jsonData: any,
    outputName: string,
    indexName: string,
  ): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });

    // purpose for docker

    // const browser = await puppeteer.launch({
    //   headless: true,
    //   executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    //   args: ['--no-sandbox', '--disable-setuid-sandbox']
    // });
    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, '../../../../templates', template);
    const fileUrl = `file://${htmlPath}`;

    const jsonString = JSON.stringify(jsonData);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().endsWith('.json')) {
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: jsonString,
        });
      }
      req.continue();
    });

    await page.goto(fileUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });
    await page.waitForSelector('#content', { visible: true, timeout: 5000 });

    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${outputName}-${indexName}.pdf`);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    return outputPath;
  }

  public async updateFactsheetData(indexName: string, jsonData: any) {
    const today = new Date();
    const monthNames = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER',
    ];
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    const formattedDate = `FACT SHEET ${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, '0')}, ${today.getFullYear()} ${hours}:${minutes}`;

    jsonData.factSheetDate = formattedDate;

    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2019 },
      (_, i) => 2019 + i,
    );

    // replace calendarYearReturns
    const indexes = await this.etfPriceService.getIndexesDatafromFile();
    const indexId =
      indexes.find((index) => index.symbol === indexName).indexId || 21;
    const navReturns = await this.etfPriceService.calculateCalendarYearReturns(
      indexId,
      years,
    );
    const priceReturns =
      await this.etfPriceService.calculateCalendarYearReturns(indexId, years);
    const benchmarkReturns =
      await this.etfPriceService.calculateCalendarYearReturns(indexId, years);

    // replace totalReturns
    const totalnavReturns =
      await this.etfPriceService.calculateTotalReturns(indexId);
    const totalpriceReturns =
      await this.etfPriceService.calculateTotalReturns(indexId);
    const totalbenchmarkReturns =
      await this.etfPriceService.calculateTotalReturns(indexId);

    // Total Holdings
    const totalHoldings = await this.etfPriceService.getTotalHoldings(indexId);

    // replace Inception date
    const inceptionDate =
      await this.etfPriceService.getInceptionDateForIndex(indexId);

    // computed riskMeasures with Bitcoin
    const dailyPrices: any[] =
      await this.etfPriceService.getIndexDailyPriceByIndexID(indexId); // daily returns of SY100
    const firstEntry = dailyPrices[0];
    const lastEntry = dailyPrices[dailyPrices.length - 1];
    const startDate = new Date(firstEntry.date);
    const endDate = new Date(lastEntry.date);
    const priceArray = dailyPrices.map((p) => Number(p.price));
    const indexReturns: number[] = [];
    for (let i = 1; i < priceArray.length; i++) {
      const prev = priceArray[i - 1];
      const curr = priceArray[i];
      const ret = (curr - prev) / prev;
      indexReturns.push(ret);
    }

    const risk = await calculateRiskMeasuresAgainstBTC(
      indexReturns,
      startDate,
      endDate,
    );

    // replace chart data
    const { chart } = this.generateMonthlyChartData(dailyPrices);

    // replace TopHoldings
    const topHoldings =
      await this.etfPriceService.getTopHoldingsFromRebalance(indexId);

    // replace IndustryDiversification
    const subIndustryDiversification =
      await this.etfPriceService.fetchSubIndustryDiversification(indexId);

    // replace assetAllocation
    // const assetAllocation = await this.etfPriceService.fetchAssetAllocation(indexId)

    const realData: Record<string, Partial<typeof jsonData>> = {
      SY100: {
        indexName: 'Symmio Crypto Top 100 Index',
        symbol: 'SY100',
        ticker: 'FTEC',
        intradayNavSymbol: 'FTEC.IV',
        cusip: '316092808',
        fundInformation: {
          type: 'SECTOR/INDUSTRY',
          sector: 'SECTOR',
          objective:
            'Investment returns that correspond, before fees and expenses, generally to the performance of the top 100 cryptocurrencies.',
          strategy:
            'Invests at least 95% of assets in cryptocurrencies included in top 100 crypto by market caps.',
          indexDescription:
            'The Symmio Crypto 100 Index is a modified market equal-weighted index that captures the large-, and mid- segments of the Crypto market. All cryptocurrencies in the index are classified according to the top 5 largest cryptocurrency exchanges.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SY100-NAV': navReturns.map((v) => v.toFixed(2)),
            'SY100—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'FTEC—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'FTEC—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 5,
          threeYear: 4,
          fiveYear: 5,
          tenYear: 5,
          categoryCount: ['243', '243', '209', '155'],
        },
        indexDetails: {
          'Management Style': 'Bi-weekly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$11,378.2M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Crypto 100 Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '2%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '35.30',
          'Price/Book': '7.95',
          '30-Day SEC Yield': '0.53%',
          'Beta (3-Yr)': '1.00',
          'Standard Deviation (3-Yr)': '23.31',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },

      SYAZ: {
        indexName: 'Symmio Top 20 A16Z Crypto VC Index',
        symbol: 'SYAZ',
        ticker: 'VC20',
        intradayNavSymbol: 'VC20.IV',
        cusip: '316092809',
        fundInformation: {
          type: 'VENTURE CAPITAL',
          sector: 'CRYPTO VC',
          objective:
            'Investment returns that correspond to the performance of leading venture-backed cryptocurrencies.',
          strategy:
            'Tracks the top 20 crypto assets backed by A16Z and similar venture capital firms.',
          indexDescription:
            'The Symmio Top 20 A16Z Crypto VC Index captures the price performance of a diversified basket of venture capital-backed cryptocurrencies.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SYAZ-NAV': navReturns.map((v) => v.toFixed(2)),
            'SYAZ—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'VC20—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'VC20—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 4,
          threeYear: 4,
          fiveYear: 4,
          tenYear: 3,
          categoryCount: ['220', '220', '200', '150'],
        },
        indexDetails: {
          'Management Style': 'Monthly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$9,002.7M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Top 20 A16Z Crypto VC Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '4%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '30.12',
          'Price/Book': '6.87',
          '30-Day SEC Yield': '0.45%',
          'Beta (3-Yr)': '1.05',
          'Standard Deviation (3-Yr)': '24.10',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },

      SYL2: {
        indexName: 'Symmio Crypto 20 Lending Index',
        symbol: 'SYL2',
        ticker: 'LEND',
        intradayNavSymbol: 'LEND.IV',
        cusip: '316092810',
        fundInformation: {
          type: 'SECTOR/INDUSTRY',
          sector: 'LENDING',
          objective:
            'Seeks to track the performance of the largest cryptocurrencies focused on decentralized lending protocols.',
          strategy:
            'Invests in 20 top lending-related cryptocurrencies by market capitalization and liquidity.',
          indexDescription:
            'The Symmio Crypto 20 Lending Index tracks major cryptocurrencies that power decentralized lending platforms such as Aave, Compound, and others.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SY100-NAV': navReturns.map((v) => v.toFixed(2)),
            'SY100—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'LEND—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'LEND—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 3,
          threeYear: 3,
          fiveYear: 4,
          tenYear: 4,
          categoryCount: ['210', '210', '180', '140'],
        },
        indexDetails: {
          'Management Style': 'Monthly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$7,844.5M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Crypto 20 Lending Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '3%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '28.76',
          'Price/Book': '5.94',
          '30-Day SEC Yield': '0.41%',
          'Beta (3-Yr)': '0.95',
          'Standard Deviation (3-Yr)': '21.90',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },

      SYAI: {
        indexName: 'Symmio Crypto 20 AI Index',
        symbol: 'SYAI',
        ticker: 'AICX',
        intradayNavSymbol: 'AICX.IV',
        cusip: '316092811',
        fundInformation: {
          type: 'SECTOR/INDUSTRY',
          sector: 'AI & MACHINE LEARNING',
          objective:
            'Provides exposure to the performance of leading cryptocurrencies powering artificial intelligence applications.',
          strategy:
            'Invests in top 20 AI-related crypto assets including those used in data labeling, inference, and decentralized AI compute.',
          indexDescription:
            'The Symmio Crypto 20 AI Index measures the performance of cryptocurrencies that support AI workloads, marketplaces, or computation protocols.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SY100-NAV': navReturns.map((v) => v.toFixed(2)),
            'SY100—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'AICX—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'AICX—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 5,
          threeYear: 5,
          fiveYear: 5,
          tenYear: 5,
          categoryCount: ['200', '200', '180', '150'],
        },
        indexDetails: {
          'Management Style': 'Monthly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$8,292.1M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Crypto 20 AI Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '3%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '38.21',
          'Price/Book': '8.12',
          '30-Day SEC Yield': '0.58%',
          'Beta (3-Yr)': '1.02',
          'Standard Deviation (3-Yr)': '22.75',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },

      SYME: {
        indexName: 'Symmio Crypto 20 MemeCoins Index',
        symbol: 'SYME',
        ticker: 'MEME',
        intradayNavSymbol: 'MEME.IV',
        cusip: '316092812',
        fundInformation: {
          type: 'SECTOR/INDUSTRY',
          sector: 'MEMECOINS',
          objective:
            'Delivers returns corresponding to the performance of the most influential meme-inspired cryptocurrencies.',
          strategy:
            'Tracks the 20 most capitalized and traded memecoins including Dogecoin, Shiba Inu, and similar assets.',
          indexDescription:
            'The Symmio Crypto 20 MemeCoins Index captures the sentiment-driven growth of leading memecoins across global exchanges.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SY100-NAV': navReturns.map((v) => v.toFixed(2)),
            'SY100—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'MEME—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'MEME—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 2,
          threeYear: 2,
          fiveYear: 3,
          tenYear: 3,
          categoryCount: ['190', '190', '170', '140'],
        },
        indexDetails: {
          'Management Style': 'Monthly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$3,208.6M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Crypto 20 MemeCoins Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '5%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '25.40',
          'Price/Book': '4.80',
          '30-Day SEC Yield': '0.37%',
          'Beta (3-Yr)': '0.92',
          'Standard Deviation (3-Yr)': '19.20',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },

      SYDF: {
        indexName: 'Symmio Crypto 20 Defi Index',
        symbol: 'SYDF',
        ticker: 'DEFI',
        intradayNavSymbol: 'DEFI.IV',
        cusip: '316092813',
        fundInformation: {
          type: 'SECTOR/INDUSTRY',
          sector: 'DEFI',
          objective:
            'Aims to replicate the returns of cryptocurrencies enabling decentralized finance protocols.',
          strategy:
            'Focuses on 20 top tokens used in lending, borrowing, trading, and yield farming.',
          indexDescription:
            'The Symmio Crypto 20 Defi Index reflects the evolution of decentralized finance through performance tracking of key protocol assets.',
        },
        calendarYearReturns: {
          years: years.map(String),
          data: {
            'SY100-NAV': navReturns.map((v) => v.toFixed(2)),
            'SY100—Market Price': priceReturns.map((v) => v.toFixed(2)),
            Benchmark: benchmarkReturns.map((v) => v.toFixed(2)),
          },
        },
        totalReturns: {
          'DEFI—NAV': {
            ...totalnavReturns,
            grossExpense: '0.084',
            netExpense: '0.084',
          },
          'DEFI—Market Price': totalpriceReturns,
          Benchmark: totalbenchmarkReturns,
        },
        morningstarRating: {
          overall: 4,
          threeYear: 3,
          fiveYear: 4,
          tenYear: 4,
          categoryCount: ['215', '215', '190', '160'],
        },
        indexDetails: {
          'Management Style': 'Monthly Rebalanced',
          Issuer: 'IndexMaker Issuer Network',
          'Index Inception Date': inceptionDate,
          'Portfolio Assets': '$6,710.4M',
          'Total Holdings': totalHoldings,
          Benchmark: 'Symmio Crypto 20 Defi Index',
          'Morningstar Category': 'Crypto',
          'Turnover Rate (1/25)': '3%',
        },
        characteristics: {
          'Price/Earnings (TTM)': '27.35',
          'Price/Book': '5.50',
          '30-Day SEC Yield': '0.49%',
          'Beta (3-Yr)': '0.97',
          'Standard Deviation (3-Yr)': '20.60',
        },
        chart: {
          finalValue: chart.finalValue,
          caption: chart.caption,
          data: chart.data,
        },
        riskMeasures: {
          Alpha: risk.Alpha,
          Beta: risk.Beta,
          'R²': risk['R²'],
          'Relative Volatility': risk['Relative Volatility'],
          'Sharpe Ratio': risk['Sharpe Ratio'],
          'Standard Deviation': risk['Standard Deviation'],
          'Tracking Error': risk['Tracking Error'],
        },
        topHoldings: topHoldings,
        subIndustryDiversification: subIndustryDiversification,
        // assetAllocation: assetAllocation
      },
    };

    if (!realData[indexName]) return jsonData;

    const overrides = realData[indexName];
    return { ...jsonData, ...overrides };
  }

  private generateMonthlyChartData(
    existingPrices: { date: Date; price: string }[],
    baseValue = 10000,
  ): {
    chart: {
      finalValue: string;
      caption: string;
      data: { month: string; value: number }[];
    };
  } {
    const pricesByMonth = new Map<string, { first: number; last: number }>();

    for (const { date, price } of existingPrices) {
      const dateObj = new Date(date);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // e.g., 2024-07
      const numericPrice = Number(price);

      if (!pricesByMonth.has(monthKey)) {
        pricesByMonth.set(monthKey, {
          first: numericPrice,
          last: numericPrice,
        });
      } else {
        pricesByMonth.get(monthKey)!.last = numericPrice;
      }
    }

    const sortedMonths = Array.from(pricesByMonth.keys()).sort();
    let data: { month: string; value: number }[] = [];
    let currentValue = baseValue;

    for (const month of sortedMonths) {
      const { first, last } = pricesByMonth.get(month)!;
      const growth = last / first;
      currentValue *= growth;

      data.push({ month, value: Math.round(currentValue) });
    }

    const finalValue = data[data.length - 1]?.value.toLocaleString() || '0';

    const [startYear, startMonth] = sortedMonths[0].split('-');
    const [endYear, endMonth] =
      sortedMonths[sortedMonths.length - 1].split('-');

    const caption = `For the period ${startMonth}/1/${startYear} to ${endMonth}/1/${endYear}.<br>Includes changes in share price and reinvestment of dividends and capital gains.`;

    return {
      chart: {
        finalValue: `$${finalValue}`,
        caption,
        data,
      },
    };
  }

  private generateDailyChartData(
    existingPrices: { date: Date; price: string }[],
    baseValue = 10000,
  ): {
    chart: {
      finalValue: string;
      caption: string;
      data: { date: string; value: number }[];
    };
  } {
    // Sort prices by date ascending
    const sorted = existingPrices
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const data: { date: string; value: number }[] = [];

    let currentValue = baseValue;
    let previousPrice: number | null = null;

    for (const { date, price } of sorted) {
      const numericPrice = Number(price);
      if (!previousPrice) {
        previousPrice = numericPrice;
      }

      const growth = numericPrice / previousPrice;
      currentValue *= growth;
      previousPrice = numericPrice;

      const formattedDate = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
      data.push({ date: formattedDate, value: Math.round(currentValue) });
    }

    const finalValue = data[data.length - 1]?.value.toLocaleString() || '0';
    const startDate = data[0]?.date;
    const endDate = data[data.length - 1]?.date;

    const caption = `For the period ${startDate} to ${endDate}.<br>Includes changes in share price and reinvestment of dividends and capital gains.`;

    return {
      chart: {
        finalValue: `$${finalValue}`,
        caption,
        data,
      },
    };
  }
}
