import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { DbService } from '../../db/db.service';
import { historicalPrices, rebalances } from '../../db/schema';
import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm';
import { ethers } from 'ethers';
import * as path from 'path';

type Weight = [string, number];

interface HistoricalEntry {
  name: string;
  date: Date;
  price: number;
  value: number;
}

@Injectable()
export class EtfPriceService {
  private provider: ethers.JsonRpcProvider;
  private indexRegistry: ethers.Contract;
  private readonly signer: ethers.Wallet;
  private priceCache: Record<string, Array<[number, number]>> = {};

  constructor(
    private indexRegistryService: IndexRegistryService,
    private coinGeckoService: CoinGeckoService,
    private dbService: DbService,
  ) {
    const rpcUrl = process.env.BASE_RPCURL || 'https://mainnet.base.org'; // Use testnet URL for Sepolia if needed
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Configure signer with private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not set in .env');
    }
    this.signer = new ethers.Wallet(privateKey, this.provider);
    const artifactPath = path.resolve(
      __dirname,
      '../../../../artifacts/contracts/src/ETFMaker/IndexRegistry.sol/IndexRegistry.json',
    );
    const IndexRegistryArtifact = require(artifactPath);
    this.indexRegistry = new ethers.Contract(
      process.env.INDEX_REGISTRY_ADDRESS || '',
      IndexRegistryArtifact.abi,
      this.provider,
    );
  }

  async computeLivePrice(indexId: string, chainId: number): Promise<number> {
    // const { tokens, weights } = await this.indexRegistryService.getIndexData(indexId, chainId);
    let totalPrice = 0;
    // for (let i = 0; i < tokens.length; i++) {
    //   const coinId = this.mapTokenToCoinGeckoId(tokens[i]); // Map ERC20 address to CoinGecko ID
    //   const price = await this.coinGeckoService.getLivePrice(coinId);
    //   totalPrice += price * (weights[i] / 10000); // Weights in basis points
    // }
    return totalPrice;
  }

  async computeHistoricalPrice(
    indexId: string,
    timestamp: number,
  ): Promise<number> {
    const rebalance = await this.dbService
      .getDb()
      .select()
      .from(rebalances)
      .where(eq(rebalances.indexId, indexId))
      .where(eq(rebalances.timestamp, timestamp))
      .limit(1);
    if (!rebalance[0]) return 0;
    const prices = rebalance[0].prices as Record<string, number>;
    const weights = JSON.parse(rebalance[0].weights) as number[];
    let totalPrice = 0;
    Object.keys(prices).forEach((token, i) => {
      totalPrice += prices[token] * (weights[i] / 10000);
    });
    return totalPrice;
  }

  async getHistoricalData(indexId: number): Promise<HistoricalEntry[]> {
    const filter = this.indexRegistry.filters.CuratorWeightsSet(indexId);
    const events = await this.indexRegistry.queryFilter(filter);
    const indexData = await this.indexRegistry.getIndexDatas(
      indexId.toString(),
    );

    const rebalanceEvents = events
      .map((event: any) => ({
        timestamp: Number(event.args.timestamp),
        price: Number(event.args.price) / 1e6,
        weights: this.indexRegistryService.decodeWeights(event.args.weights),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const historicalData: HistoricalEntry[] = [];
    let baseValue = 10000;

    // Pre-fetch all needed CoinGecko IDs once
    const allSymbols = rebalanceEvents.flatMap((event) =>
      event.weights.map((w) => w[0]),
    );
    const uniqueSymbols = [...new Set(allSymbols)];
    const coingeckoIdMap = await this.mapToCoingeckoIds(uniqueSymbols);

    for (let i = 0; i < rebalanceEvents.length; i++) {
      const current = rebalanceEvents[i];
      const next = rebalanceEvents[i + 1];
      const endTimestamp = next
        ? next.timestamp
        : Math.floor(Date.now() / 1000);
      const weights = current.weights;

      // Get all historical prices for these tokens in this period
      const tokenPrices = await this.getHistoricalPricesForPeriod(
        coingeckoIdMap,
        current.timestamp,
        endTimestamp,
      );

      for (let ts = current.timestamp; ts <= endTimestamp; ts += 86400) {
        const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
        let price = this.calculateIndexPriceFromDb(weights, tokenPrices, ts);

        if (price === null) continue;
        const prevPrice =
          historicalData.length === 0
            ? price
            : historicalData[historicalData.length - 1].price;
        baseValue = baseValue * (price / prevPrice);

        historicalData.push({
          name: indexData[0],
          date: new Date(ts * 1000),
          price,
          value: baseValue,
        });
      }
    }

    const filteredData: HistoricalEntry[] = [];
    const dateMap = new Map<string, HistoricalEntry>();

    // Process in reverse order to keep the last entry for each date
    for (let i = historicalData.length - 1; i >= 0; i--) {
      const entry = historicalData[i];
      const dateKey = entry.date.toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, entry);
      }
    }

    // Convert back to array and sort chronologically
    filteredData.push(...dateMap.values());
    filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate scaling factor based on first entry
    let scalingFactor = 1;
    if (filteredData.length > 0) {
      scalingFactor = 10000 / filteredData[0].price;
    }

    // Apply scaling to all prices and values
    const scaledData = filteredData.map((entry, index) => {
      const scaledPrice = entry.price * scalingFactor;
      const scaledValue =
        index === 0
          ? 10000 // First value should be exactly 10,000
          : filteredData[0].value *
            (scaledPrice / (filteredData[0].price * scalingFactor));

      return {
        ...entry,
        price: scaledPrice,
        value: scaledValue,
      };
    });

    return scaledData;
  }

  private async getHistoricalPricesForPeriod(
    coingeckoIdMap: Record<string, string>,
    startTimestamp: number,
    endTimestamp: number,
  ): Promise<Record<string, Array<{ timestamp: number; price: number }>>> {
    const result: Record<
      string,
      Array<{ timestamp: number; price: number }>
    > = {};

    // Get all prices for all needed tokens in one query
    const coinIds = Object.values(coingeckoIdMap);
    const prices = await this.dbService
      .getDb()
      .select()
      .from(historicalPrices)
      .where(
        and(
          inArray(historicalPrices.coinId, coinIds),
          gte(historicalPrices.timestamp, startTimestamp),
          lte(historicalPrices.timestamp, endTimestamp),
        ),
      )
      .orderBy(asc(historicalPrices.timestamp));

    // Group by symbol
    const symbolToCoinId = Object.entries(coingeckoIdMap).reduce(
      (acc, [symbol, coinId]) => {
        acc[coinId] = symbol;
        return acc;
      },
      {} as Record<string, string>,
    );

    for (const priceRecord of prices) {
      const symbol = symbolToCoinId[priceRecord.coinId];
      if (!result[symbol]) {
        result[symbol] = [];
      }
      result[symbol].push({
        timestamp: priceRecord.timestamp,
        price: priceRecord.price,
      });
    }

    return result;
  }

  private calculateIndexPriceFromDb(
    weights: Array<[string, number]>,
    tokenPrices: Record<string, Array<{ timestamp: number; price: number }>>,
    targetTimestamp: number,
  ): number | null {
    let totalValue = 0;
    let totalWeight = 0;

    for (const [symbol, weight] of weights) {
      const prices = tokenPrices[symbol];
      if (!prices || prices.length === 0) {
        // No price data for this token
        continue;
      }

      // Find the closest price to our target timestamp
      const priceRecord = this.findClosestPrice(prices, targetTimestamp);
      if (!priceRecord) continue;

      totalValue += priceRecord.price * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return null;
    return totalValue / totalWeight;
  }

  private findClosestPrice(
    prices: Array<{ timestamp: number; price: number }>,
    targetTimestamp: number,
  ): { timestamp: number; price: number } | null {
    // Prices are already sorted by timestamp
    for (let i = 0; i < prices.length; i++) {
      if (prices[i].timestamp >= targetTimestamp) {
        // Return the first price that's >= target, or the last one if none found
        return prices[i] || prices[prices.length - 1];
      }
    }
    return prices[prices.length - 1] || null;
  }

  private async mapToCoingeckoIds(
    binanceSymbols: string[],
  ): Promise<Record<string, string>> {
    const symbolToIdsMap = await this.coinGeckoService.getSymbolToIdsMap(); // Now: Record<string, string[]>

    const result: Record<string, string> = {};
    for (const binSymbol of binanceSymbols) {
      const symbol = binSymbol
        .replace(/^bi\./, '')
        .replace(/(USDT|USDC)$/i, '')
        .toUpperCase();
      const ids = symbolToIdsMap[symbol];

      if (ids) {
        result[binSymbol] = ids;
      } else {
        console.warn(`Missing CoinGecko ID for ${binSymbol}`);
      }
    }

    return result;
  }

  private getPriceAtDate(
    prices: Array<[number, number]>,
    targetDate: string,
  ): number | null {
    const target = new Date(targetDate).setUTCHours(0, 0, 0, 0);

    for (const [ts, price] of prices) {
      const day = new Date(ts).setUTCHours(0, 0, 0, 0);
      if (day === target) return price;
    }

    return null;
  }

  private calculateIndexPrice(
    weights: Weight[],
    tokenPriceHistories: Record<string, Array<[number, number]>>,
    dateStr: string,
  ): number | null {
    const totalWeight = weights.reduce((acc, [, w]) => acc + w, 0);
    let priceSum = 0;
    let valid = false;

    for (const [symbol, weight] of weights) {
      const prices = tokenPriceHistories[symbol];
      if (!prices) continue;

      const tokenPrice = this.getPriceAtDate(prices, dateStr);
      if (!tokenPrice) continue;

      priceSum += (weight / totalWeight) * tokenPrice;
      valid = true;
    }

    return valid ? priceSum : null;
  }

  async fetchCoinHistoricalData(
    coinId: string = 'bitcoin',
    startDate: Date = new Date('2019-01-01'),
    endDate: Date = new Date(),
  ): Promise<HistoricalEntry[] | null> {
    try {
      // Fetch BTC price data from CoinGecko
      const coinPriceData =
        await this.coinGeckoService.getTokenMarketChart(coinId);

      // Convert to timestamp seconds
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);

      // Create a map of date to price for efficient lookup
      const priceMap = new Map<string, number>();
      coinPriceData.forEach(([timestamp, price]) => {
        const date = new Date(timestamp).toISOString().split('T')[0];
        priceMap.set(date, price);
      });

      const historicalData: HistoricalEntry[] = [];
      let baseValue = 10000; // Starting value (100%)
      let prevPrice: number | null = null;

      // Iterate through each day in the range
      for (let ts = startTimestamp; ts <= endTimestamp; ts += 86400) {
        const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
        const price = priceMap.get(dateStr);

        // Skip if no price data for this date
        if (price === undefined) continue;

        // Calculate normalized value
        if (prevPrice === null) {
          // First data point
          prevPrice = price;
        } else {
          baseValue = baseValue * (price / prevPrice);
          prevPrice = price;
        }

        historicalData.push({
          name: 'Bitcoin (BTC)',
          date: new Date(ts * 1000),
          price,
          value: baseValue,
        });
      }

      return historicalData;
    } catch (error) {
      console.error('Error fetching BTC historical data:', error);
      return null;
    }
  }
}
