import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { DbService } from '../../db/db.service';
import { historicalPrices, rebalances } from '../../db/schema';
import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm';
import { ethers } from 'ethers';
import * as path from 'path';
import { IndexListEntry, RebalanceData } from 'src/common/types/index.types';

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
    historicalData.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        const existing = dateMap.get(dateKey);
        
        // Keep only the latest entry for each date
        if (!existing || entry.date.getTime() > existing.date.getTime()) {
            dateMap.set(dateKey, entry);
        }
    });

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

  async getRebalancedData(indexId: number): Promise<any[]> {
    const filter = this.indexRegistry.filters.CuratorWeightsSet(indexId);
    const events = await this.indexRegistry.queryFilter(filter);

    // Process events in reverse chronological order
    const reversedEvents = events
      .map((event: any) => ({
        timestamp: Number(event.args.timestamp),
        date: new Date(Number(event.args.timestamp) * 1000), // Convert to Date object
        price: Number(event.args.price) / 1e6,
        weights: this.indexRegistryService.decodeWeights(event.args.weights),
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Reverse sort (newest first)

    const eventsByDate = new Map<string, any>();

    reversedEvents.forEach((event) => {
      const dateKey = event.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      eventsByDate.set(dateKey, event); // This automatically keeps the last entry for each date
    });

    // Convert back to array
    return Array.from(eventsByDate.values());
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

  // fetch Index Lists
  async getIndexList(): Promise<IndexListEntry[]> {
    const indexList: IndexListEntry[] = [];

    // Assuming the index count is available via a contract function
    const indexCount = await this.indexRegistry.indexDatasCount();
    for (let indexId = 6; indexId <= 7; indexId++) {
      // Fetch index data
      const [
        name,
        ticker,
        curator,
        lastPrice,
        lastWeightUpdateTimestamp,
        lastPriceUpdateTimestamp,
        curatorFee,
      ] = await this.indexRegistry.getIndexDatas(indexId);

      // Fetch collateral (logos) from token symbols (weights) related to the index
      const weights = await this.indexRegistry.curatorWeights(
        indexId,
        lastWeightUpdateTimestamp,
      );
      const tokenLists = this.indexRegistryService.decodeWeights(weights); // Assuming you have a decodeWeights method
      const tokenSymbols = tokenLists.map(([token]) => token);
      const logos = await this.getLogosForSymbols(tokenSymbols);

      // Fetch Total Supply for the ERC20 contract (assuming you have a way to get ERC20 contract address for the index)
      const totalSupply = await this.getTotalSupplyForIndex(indexId);

      // Calculate YTD return (you might need to fetch historical prices for this)
      let ytdReturn = await this.calculateYtdReturn(indexId);
      ytdReturn = Math.floor(ytdReturn * 100) / 100;
      indexList.push({
        indexId,
        name,
        ticker,
        curator,
        totalSupply,
        ytdReturn,
        collateral: logos,
        managementFee: Number(curatorFee) / 1e18, // Assuming fee is in the smallest unit
      });
    }

    return indexList;
  }

  async getPriceForDate(
    indexId: number,
    targetDate: number,
  ): Promise<number | null> {
    const filter = this.indexRegistry.filters.CuratorWeightsSet(indexId);
    const events = await this.indexRegistry.queryFilter(filter);
    // Find the most recent rebalance event before target date
    const rebalanceEvents = events
      .map((event: any) => ({
        timestamp: Number(event.args.timestamp),
        weights: this.indexRegistryService.decodeWeights(event.args.weights),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Find the applicable weights (last rebalance before target date)
    const applicableWeights = rebalanceEvents
      .filter((event) => {
        return Number(event.timestamp) * 1000 <= targetDate;
      })
      .pop()?.weights;

    if (!applicableWeights) return null;

    // 2. Get price data for the target date
    const targetTimestamp = Math.floor(targetDate / 1000);
    const uniqueSymbols = [...new Set(applicableWeights.map((w) => w[0]))];
    const coingeckoIdMap = await this.mapToCoingeckoIds(uniqueSymbols);

    const tokenPrices = await this.getHistoricalPricesForPeriod(
      coingeckoIdMap,
      targetTimestamp,
      targetTimestamp,
    );

    // 3. Calculate index price
    return this.calculateIndexPriceFromDb(
      applicableWeights,
      tokenPrices,
      targetTimestamp,
    );
  }

  async getLogosForSymbols(
    symbols: string[],
  ): Promise<{ name: string; logo: string }[]> {
    const coingeckoIdMap = await this.mapToCoingeckoIds(symbols);

    return Promise.all(
      symbols.map(async (symbol) => {
        const id = coingeckoIdMap[symbol];
        if (!id) return { name: symbol, logo: '' };
        const _symbol = symbol
          .replace(/^bi\./, '')
          .replace(/(USDT|USDC)$/i, '')
          .toUpperCase();
        const data = await this.coinGeckoService.getCoinData(`/coins/${id}`);
        return {
          name: _symbol,
          logo: data.image?.thumb || '',
        };
      }),
    );
  }

  async getTotalSupplyForIndex(indexId: number): Promise<number> {
    const erc20Address = await this.getERC20AddressForIndex(indexId); // You must implement
    const erc20 = new ethers.Contract(
      erc20Address,
      ['function totalSupply() view returns (uint256)'],
      this.provider,
    );
    const supply = await erc20.totalSupply();
    return Number(ethers.formatUnits(supply, 18));
  }

  async calculateYtdReturn(indexId: number): Promise<number> {
    const now = new Date().setUTCHours(0, 0, 0, 0);
    const jan1 = new Date(new Date().getFullYear(), 0, 1).setUTCHours(
      0,
      0,
      0,
      0,
    );

    const latestPrice = await this.getPriceForDate(indexId, now);
    const jan1Price = await this.getPriceForDate(indexId, jan1);
    if (!jan1Price || jan1Price === 0) return 0;
    console.log(latestPrice);
    return (((latestPrice || 0) - jan1Price) / jan1Price) * 100;
  }

  async getHistoricalPriceForDate(
    indexId: number,
    timestamp: number,
  ): Promise<number> {
    const rounded = timestamp - (timestamp % 86400);
    const history = await this.getHistoricalData(indexId);
    const entry = history.find((e) => {
      const ts = Math.floor(new Date(e.date).getTime() / 1000);
      return Math.abs(ts - rounded) < 43200;
    });
    return entry?.price ?? 0;
  }

  async getERC20AddressForIndex(indexId: number): Promise<string> {
    const indexTokenAddressMap: Record<number, string> = {
      6: '0xac2125c4a6c7e7562cdf605fcac9f32cd9effef2', // replace with actual deployed token addresses
      7: '0x8fcf91497b456e63e15837db49411a0cce1ae1d0',
    };
    const address = indexTokenAddressMap[indexId];
    if (!address) {
      throw new Error(`ERC20 address not found for indexId: ${indexId}`);
    }
    return address;
  }
}
