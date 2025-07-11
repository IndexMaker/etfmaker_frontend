import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { DbService } from '../../db/db.service';
import {
  coinSymbols,
  dailyPrices,
  historicalPrices,
  rebalances,
  tempRebalances,
} from '../../db/schema';
import {
  ConsoleLogWriter,
  and,
  asc,
  between,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
} from 'drizzle-orm';
import { ethers } from 'ethers';
import * as path from 'path';
import {
  FundRating,
  IndexListEntry,
  VaultAsset,
} from 'src/common/types/index.types';
import { calculateLETV, formatTimestamp } from 'src/common/utils/utils';
import { promises as fs } from 'fs';

type Weight = [string, number];

interface HistoricalEntry {
  name: string;
  date: Date;
  price: number;
  value: number;
  quantities?: Record<string, number>;
}

const YOUR_START_BLOCK = 32627126;
@Injectable()
export class EtfPriceService {
  private provider: ethers.JsonRpcProvider;
  private indexRegistry: ethers.Contract;
  private readonly signer: ethers.Wallet;
  private priceCache: Record<string, Array<[number, number]>> = {};
  private indexes: { name: string; symbol: string; address: string }[];
  private readonly INDEX_LIST_PATH = path.resolve(
    process.cwd(),
    'deployedIndexes.json',
  );

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

  // async getIndexTransactions(indexId: number) {
  //   const filter = this.indexRegistry.filters.CuratorWeightsSet(indexId);
  //   const latestBlock = await this.provider.getBlockNumber();
  //   const fromBlock = Math.max(0, latestBlock - 50000);
  //   const events = await this.indexRegistry.queryFilter(
  //     filter,
  //     fromBlock,
  //     'latest',
  //   );
  //   const indexData = await this.indexRegistry.getIndexDatas(
  //     indexId.toString(),
  //   );
  //   const formattedTransactions = events
  //     .map((event: any, i) => {
  //       // Calculate timestamp (assuming block timestamp is available)
  //       const eventTimestamp = Number(
  //         event.args?.[1] || Math.floor(Date.now() / 1000) - i * 86400,
  //       ); // Fallback: space out by days

  //       // Format user address
  //       const userAddress = event.address || event.args?.[0] || '0x000...000';

  //       // Format transaction hash
  //       const txHash = event.transactionHash;

  //       // Get amount (adjust based on your event structure)
  //       const amount = event.args?.[3]
  //         ? parseFloat(ethers.formatUnits(event.args?.[3], 18))
  //         : 0;

  //       // Get market name from indexData (adjust based on your data structure)
  //       const marketName = indexData?.name || `Index ${indexId}`;
  //       return {
  //         id: `tx-${i + 1}`,
  //         timestamp: formatTimestamp(eventTimestamp),
  //         formattedTimestamp: eventTimestamp,
  //         user: userAddress,
  //         hash: txHash,
  //         amount: amount,
  //         currency: 'DM',
  //         type: 'Rebalance', // or determine from event type
  //         market: `🌬️ ${marketName} / DM`,
  //         letv: calculateLETV(amount), // Your LETV calculation
  //       };
  //     })
  //     .sort((a, b) => b.formattedTimestamp - a.formattedTimestamp);

  //   return formattedTransactions;
  // }

  // async getHistoricalData(indexId: number): Promise<HistoricalEntry[]> {
  //   // 1. Fetch all rebalances from database (sorted oldest to newest)
  //   const rebalanceEvents = await this.dbService
  //     .getDb()
  //     .select({
  //       timestamp: rebalances.timestamp,
  //       weights: rebalances.weights,
  //       prices: rebalances.prices,
  //     })
  //     .from(rebalances)
  //     .where(eq(rebalances.indexId, indexId.toString()))
  //     .orderBy(asc(rebalances.timestamp));

  //   if (rebalanceEvents.length === 0) return [];
  //   // 2. Get index metadata
  //   const indexData = await this.indexRegistry.getIndexDatas(
  //     indexId.toString(),
  //   );

  //   const historicalData: HistoricalEntry[] = [];
  //   let baseValue = 10000;

  //   // Pre-fetch all needed CoinGecko IDs once
  //   const allSymbols = rebalanceEvents.flatMap((event) =>
  //     JSON.parse(event.weights).map((w: [string, number]) => w[0]),
  //   );
  //   const uniqueSymbols: any[] = [...new Set(allSymbols)];
  //   const coingeckoIdMap = await this.mapToCoingeckoIds(uniqueSymbols);

  //   // Process each rebalance period
  //   for (let i = 0; i < rebalanceEvents.length; i++) {
  //     const current = {
  //       timestamp: Number(rebalanceEvents[i].timestamp),
  //       weights: JSON.parse(rebalanceEvents[i].weights) as [string, number][],
  //       prices: rebalanceEvents[i].prices as Record<string, number>,
  //     };

  //     const next = rebalanceEvents[i + 1];
  //     const endTimestamp = next
  //       ? Number(next.timestamp)
  //       : Math.floor(Date.now() / 1000);

  //     // Get historical prices for this period
  //     const tokenPrices = await this.getHistoricalPricesForPeriod(
  //       coingeckoIdMap,
  //       current.timestamp,
  //       endTimestamp,
  //     );

  //     // Calculate daily index prices
  //     for (let ts = current.timestamp; ts <= endTimestamp; ts += 86400) {
  //       const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
  //       const price = this.calculateIndexPriceFromDb(
  //         current.weights,
  //         tokenPrices,
  //         ts,
  //       );

  //       if (price === null) continue;

  //       const prevPrice =
  //         historicalData.length === 0
  //           ? price
  //           : historicalData[historicalData.length - 1].price;

  //       baseValue = baseValue * (price / prevPrice);

  //       historicalData.push({
  //         name: indexData.name, // Assuming indexData is not an array anymore
  //         date: new Date(ts * 1000),
  //         price,
  //         value: baseValue,
  //       });
  //     }
  //   }

  //   // Filter to keep only one entry per date (latest)
  //   const dateMap = new Map<string, HistoricalEntry>();
  //   historicalData.forEach((entry) => {
  //     const dateKey = entry.date.toISOString().split('T')[0];
  //     if (!dateMap.has(dateKey) || entry.date > dateMap.get(dateKey)!.date) {
  //       dateMap.set(dateKey, entry);
  //     }
  //   });

  //   const filteredData = Array.from(dateMap.values()).sort(
  //     (a, b) => a.date.getTime() - b.date.getTime(),
  //   );

  //   // Apply scaling (normalize to 10,000 starting value)
  //   if (filteredData.length > 0) {
  //     const scalingFactor = 10000 / filteredData[0].price;
  //     return filteredData.map((entry, index) => ({
  //       ...entry,
  //       price: entry.price * scalingFactor,
  //       value:
  //         index === 0
  //           ? 10000
  //           : filteredData[0].value * (entry.price / filteredData[0].price),
  //     }));
  //   }

  //   return [];
  // }

  async getIndexMakerInfo() {
    // Get current USDC balance
    const usdcContract = new ethers.Contract(
      process.env.USDC_ADDRESS_IN_BASE!,
      ['function balanceOf(address) view returns (uint256)'],
      this.provider,
    );
    const totalVolume = await usdcContract.balanceOf(
      process.env.OTC_CUSTODY_ADDRESS!,
    );

    // Get deposit events to calculate volume
    const depositLogs = await this.provider.getLogs({
      address: process.env.OTC_CUSTODY_ADDRESS!,
      topics: [ethers.id('Deposit(uint256,address)')],
    });

    const totalManaged = 0n;

    return {
      totalManaged: ethers.formatUnits(totalManaged, 6),
      totalVolume: ethers.formatUnits(totalVolume, 6),
    };
  }

  async getDepositTransactions(indexId: number, address?: string) {
    // Handle case when indexId is -1 (get all indexes)
    if (indexId == -1) {
      const raw = await fs.readFile(this.INDEX_LIST_PATH, 'utf8');
      const allIndexes: Array<any> = JSON.parse(raw);

      // Get deposits for all indexes in parallel
      const allDeposits = await Promise.all(
        allIndexes.map(async (index) => {
          const indexDeposits = await this.getDepositTransactions(
            Number(index.indexId),
            address,
          );
          return indexDeposits;
        }),
      );

      // Flatten the array and filter for user's address if provided
      const flattenedDeposits = allDeposits.flat();
      return address
        ? flattenedDeposits.filter(
            (deposit) => deposit?.user.toLowerCase() === address.toLowerCase(),
          )
        : flattenedDeposits;
    }

    // Original logic for specific indexId
    const indexData = await this.getIndexDataFromFile(indexId);
    if (!indexData?.address) throw new Error(`Index ${indexId} not found`);

    const iface = new ethers.Interface([
      'event Deposit(uint256 amount, address from, uint256 seqNumNewOrderSingle, address affiliate1, address affiliate2)',
      'function balanceOf(address account) view returns (uint256)',
      'function totalSupply() view returns (uint256)',
    ]);

    // Filter by user address in event topics if address is provided
    const filter: any = {
      address: indexData.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.id('Deposit(uint256,address,uint256,address,address)')],
    };

    // if (address) {
    //   filter.topics.push(ethers.zeroPadValue(address, 32)); // Add address filter
    // }

    // const depositLogs = await this.provider.getLogs(filter);

    const depositLogs = await this.provider.getLogs({
      address: indexData.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.id('Deposit(uint256,address,uint256,address,address)')],
    });

    const indexContract = new ethers.Contract(
      indexData.address,
      iface,
      this.provider,
    );

    const totalSupply = await indexContract.totalSupply();
    const USDValueOfUSDC =
      await this.coinGeckoService.getUSDCUSDPrice('usd-coin');

    const deposits = await Promise.all(
      depositLogs.map(async (log, i) => {
        const parsed = iface.parseLog(log);
        if (!parsed) return;

        const user = parsed.args.from as string;
        const amount = parsed.args.amount as bigint;
        const userBalance = await indexContract.balanceOf(user);

        const sharePercentage =
          totalSupply > 0
            ? (Number(userBalance) / Number(totalSupply)) * 100
            : 0;

        return {
          id: `deposit-${log.transactionHash}-${i}`,
          indexId: indexData.indexId,
          indexName: indexData.name,
          indexSymbol: indexData.symbol,
          user,
          supply: ethers.formatUnits(amount, 6),
          supplyValueUSD:
            Number(ethers.formatUnits(amount, 6)) * USDValueOfUSDC,
          currency: 'USDC',
          share: sharePercentage.toFixed(2),
          rawShare: sharePercentage,
          userBalance: ethers.formatUnits(userBalance, 18),
          totalSupply: ethers.formatUnits(totalSupply, 18),
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        };
      }),
    );

    // Filter by address again in case the topic filter didn't work perfectly
    const filteredDeposits = deposits.filter(Boolean);
    return filteredDeposits;
  }

  async getUserTransactions(indexId: number): Promise<any[]> {
    const indexData = await this.getIndexDataFromFile(indexId);
    if (!indexData?.address) throw new Error(`Index ${indexId} not found`);

    const iface = new ethers.Interface([
      'event Mint(uint256 amount, address to, uint256 seqNumExecutionReport)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);
    const mintTopic = ethers.id('Mint(uint256,address,uint256)');
    const transferTopic = ethers.id('Transfer(address,address,uint256)');
    const [mintLogs, transferLogs] = await Promise.all([
      this.provider.getLogs({
        address: indexData.address,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [mintTopic],
      }),
      this.provider.getLogs({
        address: indexData.address,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [transferTopic],
      }),
    ]);

    const parseToActivity = async (
      logs: ethers.Log[],
      eventName: 'Mint' | 'Transfer',
    ): Promise<any[]> => {
      return Promise.all(
        logs.map(async (log, i) => {
          const parsed = iface.parseLog(log);
          const block = await this.provider.getBlock(log.blockNumber);
          if (!block || !parsed) return null;
          const dateTime = new Date(block.timestamp * 1000).toISOString();

          let amountRaw: bigint;
          let wallet: string;

          if (eventName === 'Mint') {
            amountRaw = parsed.args.amount;
            wallet = parsed.args.to;
          } else {
            amountRaw = parsed.args.value;
            wallet = parsed.args.to; // or `from`, depending on perspective
          }

          const amount = Number(ethers.formatUnits(amountRaw, 6)); // assuming USDC

          return {
            id: `${eventName.toLowerCase()}-${log.transactionHash}-${i}`,
            dateTime,
            wallet,
            hash: log.transactionHash,
            transactionType: eventName,
            amount: {
              amount,
              currency: 'USDC',
              amountSummary: `${amount.toLocaleString()} USDC`,
            },
          };
        }),
      );
    };

    const [mintActivities, transferActivities] = await Promise.all([
      parseToActivity(mintLogs, 'Mint'),
      parseToActivity(transferLogs, 'Transfer'),
    ]);

    return [...mintActivities, ...transferActivities].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    );
  }

  async getIndexTransactions(indexId: number) {
    const indexData = await this.getIndexDataFromFile(indexId);
    if (!indexData?.address) throw new Error(`Index ${indexId} not found`);

    const iface = new ethers.Interface([
      'event CuratorUpdate(uint256 timestamp, bytes weights, uint256 nav)',
    ]);

    const START_BLOCK = 0;
    const logs = await this.provider.getLogs({
      address: indexData.address,
      fromBlock: START_BLOCK,
      toBlock: 'latest',
      topics: [ethers.id('CuratorUpdate(uint256,bytes,uint256)')],
    });

    const txMap = new Map<number, any>(); // timestamp => transaction

    logs.forEach((log, i) => {
      try {
        const parsed = iface.parseLog(log);
        if (!parsed) return null;
        const blockTimestamp = Number(parsed.args.timestamp);
        const tx = {
          id: `chain-${log.transactionHash}-${i}`,
          timestamp: formatTimestamp(blockTimestamp),
          formattedTimestamp: blockTimestamp,
          user: 'System',
          hash: log.transactionHash,
          currency: 'USDC',
          type: 'Rebalance',
          letv: 0,
          weights: parsed.args.weights,
          prices: null,
          coins: null,
        };

        // This will overwrite any previous tx with the same timestamp
        txMap.set(blockTimestamp, tx);
      } catch (e) {
        // skip invalid logs
      }
    });

    const formattedTransactions = Array.from(txMap.values()).sort(
      (a, b) => b.formattedTimestamp - a.formattedTimestamp,
    );

    return formattedTransactions;
  }

  async getHistoricalData(indexId: number): Promise<HistoricalEntry[]> {
    const indexData = await this.getIndexDataFromFile(indexId);

    // 1. First try to get complete existing data from database
    const existingPrices = await this.dbService
      .getDb()
      .select({
        date: dailyPrices.date,
        price: dailyPrices.price,
      })
      .from(dailyPrices)
      .where(eq(dailyPrices.indexId, indexId.toString()))
      .orderBy(asc(dailyPrices.date));

    // If we have complete historical data, return it immediately
    if (existingPrices.length > 0) {
      const latestDate = existingPrices[existingPrices.length - 1].date;
      const isUpToDate = latestDate >= new Date(Date.now() - 86400 * 1000);

      return existingPrices.map((row) => ({
        name: indexData?.name, // Will be filled below
        date: row.date,
        price: Number(row.price),
        value: Number(row.price),
      }));
    }

    // 2. Get all rebalance events
    const rebalanceData = await this.dbService.getDb().execute(
      sql`
        SELECT timestamp, weights, prices
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY timestamp ORDER BY created_at DESC) as rn
          FROM ${rebalances}
          WHERE ${rebalances.indexId} = ${indexId.toString()}
        ) sub
        WHERE rn = 1
        ORDER BY timestamp ASC;
      `,
    );

    const rebalanceEvents = rebalanceData.rows;

    if (rebalanceEvents.length === 0) return [];

    // 4. Prepare calculation for missing dates only
    const historicalData: HistoricalEntry[] = [
      ...existingPrices.map((p) => ({
        name: indexData?.name,
        date: p.date,
        price: Number(p.price),
        value: Number(p.price),
      })),
    ];

    let currentQuantities: Record<string, number> = {};
    let lastKnownPrice =
      historicalData.length > 0
        ? historicalData[historicalData.length - 1].price
        : 10000; // Default to 10,000 if no history

    // 5. Get all needed Coingecko IDs
    const allSymbols: any[] = rebalanceEvents.flatMap((event) =>
      JSON.parse(event.weights).map((w: [string, number]) => w[0]),
    );
    const coingeckoIdMap = await this.mapToCoingeckoIds([
      ...new Set(allSymbols),
    ]);

    // 6. Process each period between rebalances
    for (let i = 0; i < rebalanceEvents.length; i++) {
      const rebalance = {
        timestamp: Number(rebalanceEvents[i].timestamp),
        weights: JSON.parse(rebalanceEvents[i].weights) as [string, number][],
        prices: rebalanceEvents[i].prices as Record<string, number>,
      };

      const nextRebalance = rebalanceEvents[i + 1];
      const endTimestamp = nextRebalance
        ? Number(nextRebalance.timestamp)
        : Math.floor(Date.now() / 1000);

      // Calculate quantities at rebalance point
      currentQuantities = this.calculateTokenQuantities(
        rebalance.weights,
        rebalance.prices,
        lastKnownPrice,
      );

      // Calculate only missing dates
      const startDate = this.normalizeToNextUtcMidnight(
        new Date(rebalance.timestamp * 1000),
      );
      startDate.setUTCHours(0, 0, 0, 0);

      let endDate;
      if (this.isUtcMidnight(new Date(endTimestamp * 1000))) {
        endDate = this.normalizeToNextUtcMidnight(
          new Date(endTimestamp * 1000),
        );
      } else {
        endDate = new Date(endTimestamp * 1000);
      }

      // Get historical prices for this period
      const tokenPrices = await this.getHistoricalPricesForPeriod(
        coingeckoIdMap,
        startDate.getTime() / 1000,
        endDate.getTime() / 1000,
      );

      for (let d = startDate; d < endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const date = d;
        const dateStr = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // Skip if we already have this date
        if (existingPrices.some((p) => p.date === dateStr)) {
          continue;
        }

        const ts = Math.floor(d.getTime() / 1000); // Timestamp at midnight UTC

        const price = this.calculateIndexPrice(
          currentQuantities,
          tokenPrices,
          ts,
        );
        if (price === null) continue;
        lastKnownPrice = Number(price.toFixed(2));

        const entry: HistoricalEntry = {
          name: indexData?.name || '',
          date: new Date(ts * 1000), // Keep as string in 'YYYY-MM-DD' format
          price: Number(price.toFixed(2)),
          value: price,
          quantities: currentQuantities,
        };

        historicalData.push(entry);
        await this.storeDailyPrice(
          indexId,
          dateStr,
          Number(price.toFixed(2)),
          currentQuantities,
        ); // Also pass 'YYYY-MM-DD' string to DB
      }
    }

    // Return sorted and deduplicated
    return historicalData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async getHistoricalDataFromTempRebalances(
    indexId: number,
  ): Promise<HistoricalEntry[]> {
    const indexData = await this.getIndexDataFromFile(indexId);

    // 1. Get all rebalance events
    const rebalanceData = await this.dbService.getDb().execute(
      sql`
        SELECT timestamp, weights, prices, coins
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY timestamp ORDER BY created_at DESC) as rn
          FROM ${tempRebalances}
          WHERE ${tempRebalances.indexId} = ${indexId.toString()}
        ) sub
        WHERE rn = 1
        ORDER BY timestamp ASC;
      `,
    );
    const rebalanceEvents = rebalanceData.rows;
    if (rebalanceEvents.length === 0) return [];

    const historicalData: HistoricalEntry[] = [];
    let currentQuantities: Record<string, number> = {};
    let lastKnownPrice = 10000; // Initial value

    // 2. Get all unique Coingecko IDs
    const allCoinIds = new Set<string>();
    rebalanceEvents.forEach((event) => {
      const coins =
        typeof event.coins === 'string' ? JSON.parse(event.coins) : event.coins;
      Object.keys(coins).forEach((id) => allCoinIds.add(id));
    });

    const symbolMappings = await this.dbService
      .getDb()
      .select({
        coinId: coinSymbols.coinId,
        symbol: coinSymbols.symbol,
      })
      .from(coinSymbols)
      .where(inArray(coinSymbols.coinId, Array.from(allCoinIds)));

    // Handle missing coinIds
    const existingCoinIds = new Set(symbolMappings.map((row) => row.coinId));
    const missingCoinIds = Array.from(allCoinIds).filter(
      (id) => !existingCoinIds.has(id),
    );
    if (missingCoinIds.length > 0) {
      for (const coinId of missingCoinIds) {
        const _symbol =
          await this.coinGeckoService.getSymbolFromCoinGecko(coinId);
        _symbol && symbolMappings.push({ coinId, symbol: _symbol });
      }
    }

    // 3. Find the correct trading pair (prioritize Binance USDC > Binance USDT > Bitget USDC > Bitget USDT)
    const findTradingPair = (
      prices: Record<string, number>,
      symbol: string,
    ): string | null => {
      const upperSymbol = symbol.toUpperCase();
      const possiblePairs = [
        `bi.${upperSymbol}USDC`, // Binance USDC
        `bi.${upperSymbol}USDT`, // Binance USDT
        `bg.${upperSymbol}USDC`, // Bitget USDC
        `bg.${upperSymbol}USDT`, // Bitget USDT
      ];
      return possiblePairs.find((pair) => prices[pair] !== undefined) || null;
    };

    // 4. Process each period between rebalances
    for (let i = 0; i < rebalanceEvents.length; i++) {
      // for (let i = 40; i < 41; i++) {
      const rebalance = {
        timestamp: Number(rebalanceEvents[i].timestamp),
        weights: JSON.parse(rebalanceEvents[i].weights) as [string, number][],
        prices:
          typeof rebalanceEvents[i].prices === 'string'
            ? JSON.parse(rebalanceEvents[i].prices)
            : rebalanceEvents[i].prices,
        coins: rebalanceEvents[i].coins as Record<string, number>,
      };

      const nextRebalance = rebalanceEvents[i + 1];
      const endTimestamp = nextRebalance
        ? Number(nextRebalance.timestamp)
        : Math.floor(Date.now() / 1000 - 86400);

      // Create price map using the best available pairs
      const tokenPrices: Record<string, number> = {};
      symbolMappings.forEach((row) => {
        const pair = findTradingPair(rebalance.prices, row.symbol);
        if (pair) {
          tokenPrices[row.coinId] = rebalance.prices[pair];
        }
      });
      // Modified for a while as a quick deploying

      // currentQuantities = this.calculateTokenQuantitiesFromTempRebalance(
      //   typeof rebalance.coins === 'string'
      //     ? JSON.parse(rebalance.coins)
      //     : rebalance.coins,
      //   tokenPrices,
      //   lastKnownPrice,
      // );

      let effectiveCoins =
        typeof rebalance.coins === 'string'
          ? JSON.parse(rebalance.coins)
          : rebalance.coins;

      if (
        indexId === 21 &&
        i === rebalanceEvents.length - 1 // last rebalance only
      ) {
        // Convert weights to synthetic BTC weight
        const adjustedWeights =
          await this.indexRegistryService.replaceBitgetWeightsWithBTC(
            rebalance.weights,
          );
        // Create synthetic coins from adjusted weights
        effectiveCoins = {};
        for (const [pair, weight] of adjustedWeights) {
          const coinId = symbolMappings.find((row) => {
            const p = findTradingPair(rebalance.prices, row.symbol);
            return p === pair;
          })?.coinId;

          if (coinId) {
            effectiveCoins[coinId] = weight;
          }
        }
      }

      currentQuantities = this.calculateTokenQuantitiesFromTempRebalance(
        effectiveCoins,
        tokenPrices,
        lastKnownPrice,
      );

      // Set date range for this period
      const startDate = this.normalizeToNextUtcMidnight(
        new Date(rebalance.timestamp * 1000),
      );
      startDate.setUTCHours(0, 0, 0, 0);

      let endDate;
      if (this.isUtcMidnight(new Date(endTimestamp * 1000))) {
        endDate = this.normalizeToNextUtcMidnight(
          new Date(endTimestamp * 1000),
        );
      } else {
        endDate = new Date(endTimestamp * 1000);
      }

      // Get historical prices for this period
      const coingeckoIdMap = symbolMappings.reduce(
        (acc, row) => {
          acc[row.symbol] = row.coinId;
          return acc;
        },
        {} as Record<string, string>,
      );

      const dailyTokenPrices =
        await this.getHistoricalPricesForPeriodWithCoinId(
          coingeckoIdMap,
          startDate.getTime() / 1000,
          endDate.getTime() / 1000,
        );
      // Process each day in the period
      for (
        let d = new Date(startDate);
        d < endDate;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const date = new Date(d);
        const dateStr = date.toISOString().split('T')[0];
        const ts = Math.floor(date.getTime() / 1000);
        const price = this.calculateIndexPrice(
          currentQuantities,
          dailyTokenPrices,
          ts,
        );
        if (price === null) continue;
        lastKnownPrice = Number(price.toFixed(2));
        historicalData.push({
          name: indexData?.name || '',
          date: new Date(ts * 1000),
          price: lastKnownPrice,
          value: lastKnownPrice,
          quantities: currentQuantities,
        });

        await this.storeDailyPrice(
          indexId,
          dateStr,
          lastKnownPrice,
          currentQuantities,
        );
      }
    }

    return historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private isUtcMidnight = (date: Date): boolean => {
    return (
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0
    );
  };

  private normalizeToNextUtcMidnight = (date: Date): Date => {
    const isMidnight =
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0;

    if (isMidnight) return date;

    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + 1,
      ),
    );
  };

  async getLastDailyETFPrice(indexId: number): Promise<HistoricalEntry[]> {
    // 1. First try to get complete existing data from database
    const existingPrices = await this.dbService
      .getDb()
      .select({
        date: dailyPrices.date,
        price: dailyPrices.price,
      })
      .from(dailyPrices)
      .where(eq(dailyPrices.indexId, indexId.toString()))
      .orderBy(asc(dailyPrices.date));

    // If we have complete historical data, return it immediately
    if (existingPrices.length > 0) {
      const latestDate = existingPrices[existingPrices.length - 1].date;
      const isUpToDate = latestDate >= new Date(Date.now() - 86400 * 1000);

      return existingPrices.map((row) => ({
        name: '', // Will be filled below
        date: row.date,
        price: Number(row.price),
        value: Number(row.price),
      }));
    }

    // 2. Get all rebalance events
    const rebalanceEvents = await this.dbService.getDb().execute(
      sql`
        SELECT timestamp, weights, prices
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY timestamp ORDER BY created_at DESC) as rn
          FROM ${rebalances}
          WHERE ${rebalances.indexId} = ${indexId.toString()}
        ) sub
        WHERE rn = 1
        ORDER BY timestamp ASC;
      `,
    );

    if (rebalanceEvents.length === 0) return [];

    // 4. Prepare calculation for missing dates only
    const historicalData: HistoricalEntry[] = [
      ...existingPrices.map((p) => ({
        name: '',
        date: p.date,
        price: Number(p.price),
        value: Number(p.price),
      })),
    ];

    let currentQuantities: Record<string, number> = {};
    let lastKnownPrice =
      historicalData.length > 0
        ? historicalData[historicalData.length - 1].price
        : 10000; // Default to 10,000 if no history

    // 5. Get all needed Coingecko IDs
    const allSymbols: any[] = rebalanceEvents.flatMap((event) =>
      JSON.parse(event.weights).map((w: [string, number]) => w[0]),
    );
    const coingeckoIdMap = await this.mapToCoingeckoIds([
      ...new Set(allSymbols),
    ]);

    // 6. Process each period between rebalances
    for (let i = 0; i < rebalanceEvents.length; i++) {
      const rebalance = {
        timestamp: Number(rebalanceEvents[i].timestamp),
        weights: JSON.parse(rebalanceEvents[i].weights) as [string, number][],
        prices: rebalanceEvents[i].prices as Record<string, number>,
      };

      const nextRebalance = rebalanceEvents[i + 1];
      const endTimestamp = nextRebalance
        ? Number(nextRebalance.timestamp)
        : Math.floor(Date.now() / 1000);

      // Calculate quantities at rebalance point
      currentQuantities = this.calculateTokenQuantities(
        rebalance.weights,
        rebalance.prices,
        lastKnownPrice,
      );
      // Get historical prices for this period
      const tokenPrices = await this.getHistoricalPricesForPeriod(
        coingeckoIdMap,
        rebalance.timestamp,
        endTimestamp,
      );

      // Calculate only missing dates
      for (let ts = rebalance.timestamp; ts <= endTimestamp; ts += 86400) {
        const currentDate = new Date(ts * 1000);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Skip if we already have this date
        if (existingPrices.some((p) => p.date === dateStr)) {
          continue;
        }

        const price = this.calculateIndexPrice(
          currentQuantities,
          tokenPrices,
          ts,
        );

        if (price === null) continue;

        lastKnownPrice = price;
        const entry = {
          name: '',
          date: currentDate,
          price,
          value: price,
        };

        historicalData.push(entry);
        await this.storeDailyPrice(indexId, dateStr, price, currentQuantities);
      }
    }

    // Return sorted and deduplicated
    return historicalData
      .filter((v, i, a) => a.findIndex((t) => t.date === v.date) === i)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateTokenQuantities(
    weights: [string, number][],
    prices: Record<string, number>,
    portfolioValue: number,
  ): Record<string, number> {
    const quantities: Record<string, number> = {};

    for (const [token, weight] of weights) {
      const tokenPrice = prices[token];
      if (!tokenPrice) continue;

      quantities[token] = (portfolioValue * weight) / tokenPrice / 10000;
    }

    return quantities;
  }

  private calculateTokenQuantitiesFromTempRebalance(
    coins: Record<string, number>,
    prices: Record<string, number>,
    indexValue: number,
  ): Record<string, number> {
    const quantities: Record<string, number> = {};

    // Calculate total weight from coins object
    const totalWeight = Object.values(coins).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    // Calculate the dollar amount to allocate to each asset
    const dollarAllocation = indexValue / totalWeight;

    // Iterate through coins instead of weights
    for (const [coinId, weight] of Object.entries(coins)) {
      if (coinId) {
        const price = prices[coinId];
        if (price && price > 0) {
          quantities[coinId] = (dollarAllocation * weight) / price;
        }
      }
    }

    return quantities;
  }

  private calculateIndexPrice(
    quantities: Record<string, number>,
    tokenPrices: Record<string, Array<{ timestamp: number; price: number }>>,
    timestamp: number,
  ): number | null {
    let portfolioValue = 0;
    let hasData = false;

    for (const [token, quantity] of Object.entries(quantities)) {
      const prices = tokenPrices[token];
      if (!prices) {
        continue;
      }

      const priceRecord = this.findClosestPrice(prices, timestamp);
      if (!priceRecord) {
        continue;
      }

      if (priceRecord) {
        portfolioValue += quantity * (priceRecord.price * 1);
        hasData = true;
      }
    }
    return hasData ? portfolioValue : null;
  }

  private async storeDailyPrice(
    indexId: number,
    date: string,
    price: number,
    quantities: Record<string, number>,
  ) {
    try {
      await this.dbService
        .getDb()
        .insert(dailyPrices)
        .values({
          indexId: indexId.toString(),
          date,
          price: price.toString(),
          quantities: JSON.stringify(quantities),
        })
        .onConflictDoUpdate({
          target: [dailyPrices.indexId, dailyPrices.date],
          set: {
            price: price.toString(),
            quantities: JSON.stringify(quantities),
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error('Error storing daily price:', error);
    }
  }

  // store daily etf prices for cron job
  async storeDailyETFPrices(indexIds: number[]) {
    try {
      const allIndexes = indexIds;
      const yesterday = new Date(Date.now()); // 86400000 ms = 1 day
      yesterday.setUTCHours(0, 0, 0, 0);

      for (const index of allIndexes) {
        try {
          // Check if yesterday's price already exists
          const history = await this.getLastDailyETFPrice(index);

          // The last entry should now include yesterday
          const latestEntry = history[history.length - 1];
          if (!latestEntry) return;
          const latestDate = latestEntry.date;
          if (new Date(latestEntry.date).getDate() === yesterday.getDate()) {
            const exists = await this.dbService
              .getDb()
              .select()
              .from(dailyPrices)
              .where(
                and(
                  eq(dailyPrices.indexId, index.toString()),
                  eq(
                    dailyPrices.date,
                    new Date(latestDate).toISOString().split('T')[0],
                  ),
                ),
              )
              .limit(1);

            if (exists.length === 0) {
              // 5. Store only the latest price if missing
              // await this.storeDailyPrice(index, latestDate, latestEntry.price);
              console.log(
                `Stored ${index} price for ${latestDate}: ${latestEntry.price}`,
              );
            }
          } else {
            console.log(
              `Skipped ${index} price for ${new Date(latestEntry.date).getDate()}: ${yesterday.getDate()}`,
            );
          }
        } catch (error) {
          console.error(`Error updating index ${index}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Job failed: ${error.message}`);
    }
  }

  async getDailyPriceData(indexId: number): Promise<any[]> {
    const indexData = await this.getIndexDataFromFile(indexId);

    const existingPrices = await this.dbService
      .getDb()
      .select({
        date: dailyPrices.date,
        price: dailyPrices.price,
        quantities: dailyPrices.quantities,
      })
      .from(dailyPrices)
      .where(eq(dailyPrices.indexId, indexId.toString()))
      .orderBy(asc(dailyPrices.date));

    if (existingPrices.length === 0) return [];

    // Step 1: Parse quantities and collect all unique coinIds
    const parsedData = existingPrices.map((row) => ({
      ...row,
      quantities: row.quantities as Record<string, number>,
    }));

    const allCoinIds = new Set<string>();
    parsedData.forEach((row) => {
      Object.keys(row.quantities).forEach((coinId) => allCoinIds.add(coinId));
    });

    // Step 2: Get full timestamp range for daily_prices
    const timestamps = parsedData.map((row) =>
      Math.floor(new Date(row.date).getTime() / 1000),
    );
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    // Step 3: Query historical prices in batch
    const coinIdList = Array.from(allCoinIds);
    const historical = await this.dbService
      .getDb()
      .select()
      .from(historicalPrices)
      .where(
        and(
          inArray(historicalPrices.coinId, coinIdList),
          between(
            historicalPrices.timestamp,
            minTimestamp - 86400,
            maxTimestamp + 86400,
          ),
        ),
      );

    // Step 4: Build a price lookup map: { coinId => [ { timestamp, price } ] }
    const priceMap = new Map<string, { timestamp: number; price: number }[]>();
    for (const row of historical) {
      if (!priceMap.has(row.coinId)) {
        priceMap.set(row.coinId, []);
      }
      priceMap
        .get(row.coinId)!
        .push({ timestamp: row.timestamp, price: row.price });
    }

    // Ensure each list is sorted by timestamp
    for (const [_, list] of priceMap) {
      list.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Helper: Find nearest price by timestamp (assumes sorted list)
    const findNearestPrice = (coinId: string, targetTs: number) => {
      const prices = priceMap.get(coinId);
      if (!prices) return null;
      let left = 0;
      let right = prices.length - 1;
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (prices[mid].timestamp < targetTs) left = mid + 1;
        else right = mid;
      }
      const best = prices[left];
      if (!best) return null;

      // Compare with previous to find closer one
      if (left > 0) {
        const prev = prices[left - 1];
        return Math.abs(prev.timestamp - targetTs) <
          Math.abs(best.timestamp - targetTs)
          ? prev.price
          : best.price;
      }
      return best.price;
    };

    // Step 5: Build final output
    const results = parsedData.map((row) => {
      const targetTs = Math.floor(new Date(row.date).getTime() / 1000);

      const dailyCoinPrices: Record<string, number> = {};
      for (const coinId of Object.keys(row.quantities)) {
        const price = findNearestPrice(coinId, targetTs);
        if (price !== null) dailyCoinPrices[coinId] = price;
      }

      return {
        index: indexData?.name,
        indexId,
        date: row.date,
        quantities: row.quantities,
        price: Number(row.price),
        value: Number(row.price),
        coinPrices: dailyCoinPrices, // Add per-day coin prices
      };
    });

    return results;
  }

  async getTempRebalancedData(indexId: number): Promise<any[]> {
    const indexData = await this.getIndexDataFromFile(indexId);
    const result: any[] = [];

    // 1. Get all rebalance events
    const rebalanceData = await this.dbService.getDb().execute(
      sql`
        SELECT timestamp, weights, prices, coins
        FROM (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY timestamp ORDER BY created_at DESC) as rn
          FROM ${tempRebalances}
          WHERE ${tempRebalances.indexId} = ${indexId.toString()}
        ) sub
        WHERE rn = 1
        ORDER BY timestamp ASC;
      `,
    );
    const rebalanceEvents = rebalanceData.rows;
    if (rebalanceEvents.length === 0) return [];

    const historicalData: HistoricalEntry[] = [];
    let currentQuantities: Record<string, number> = {};
    let lastKnownPrice = 10000; // Initial value

    // 2. Get all unique Coingecko IDs
    const allCoinIds = new Set<string>();
    rebalanceEvents.forEach((event) => {
      const coins =
        typeof event.coins === 'string' ? JSON.parse(event.coins) : event.coins;
      Object.keys(coins).forEach((id) => allCoinIds.add(id));
    });

    const symbolMappings = await this.dbService
      .getDb()
      .select({
        coinId: coinSymbols.coinId,
        symbol: coinSymbols.symbol,
      })
      .from(coinSymbols)
      .where(inArray(coinSymbols.coinId, Array.from(allCoinIds)));

    // Handle missing coinIds
    const existingCoinIds = new Set(symbolMappings.map((row) => row.coinId));
    const missingCoinIds = Array.from(allCoinIds).filter(
      (id) => !existingCoinIds.has(id),
    );
    if (missingCoinIds.length > 0) {
      for (const coinId of missingCoinIds) {
        const _symbol =
          await this.coinGeckoService.getSymbolFromCoinGecko(coinId);
        _symbol && symbolMappings.push({ coinId, symbol: _symbol });
      }
    }

    // 3. Find the correct trading pair (prioritize Binance USDC > Binance USDT > Bitget USDC > Bitget USDT)
    const findTradingPair = (
      prices: Record<string, number>,
      symbol: string,
    ): string | null => {
      const upperSymbol = symbol.toUpperCase();
      const possiblePairs = [
        `bi.${upperSymbol}USDC`, // Binance USDC
        `bi.${upperSymbol}USDT`, // Binance USDT
        `bg.${upperSymbol}USDC`, // Bitget USDC
        `bg.${upperSymbol}USDT`, // Bitget USDT
      ];
      return possiblePairs.find((pair) => prices[pair] !== undefined) || null;
    };

    // 4. Process each period between rebalances
    for (let i = 0; i < rebalanceEvents.length; i++) {
      // for (let i = 40; i < 41; i++) {
      const rebalance = {
        timestamp: Number(rebalanceEvents[i].timestamp),
        weights: JSON.parse(rebalanceEvents[i].weights) as [string, number][],
        prices:
          typeof rebalanceEvents[i].prices === 'string'
            ? JSON.parse(rebalanceEvents[i].prices)
            : rebalanceEvents[i].prices,
        coins: rebalanceEvents[i].coins as Record<string, number>,
      };

      const nextRebalance = rebalanceEvents[i + 1];
      const endTimestamp = nextRebalance
        ? Number(nextRebalance.timestamp)
        : Math.floor(Date.now() / 1000 - 86400);

      // Create price map using the best available pairs
      const tokenPrices: Record<string, number> = {};
      symbolMappings.forEach((row) => {
        const pair = findTradingPair(rebalance.prices, row.symbol);
        if (pair) {
          tokenPrices[row.coinId] = rebalance.prices[pair];
        }
      });
      // Calculate quantities at rebalance point
      currentQuantities = this.calculateTokenQuantitiesFromTempRebalance(
        typeof rebalance.coins === 'string'
          ? JSON.parse(rebalance.coins)
          : rebalance.coins,
        tokenPrices,
        lastKnownPrice,
      );

      // Set date range for this period
      const startDate = this.normalizeToNextUtcMidnight(
        new Date(rebalance.timestamp * 1000),
      );
      startDate.setUTCHours(0, 0, 0, 0);

      let endDate;
      if (this.isUtcMidnight(new Date(endTimestamp * 1000))) {
        endDate = this.normalizeToNextUtcMidnight(
          new Date(endTimestamp * 1000),
        );
      } else {
        endDate = new Date(endTimestamp * 1000);
      }

      // Get historical prices for this period
      const coingeckoIdMap = symbolMappings.reduce(
        (acc, row) => {
          acc[row.symbol] = row.coinId;
          return acc;
        },
        {} as Record<string, string>,
      );

      const dailyTokenPrices =
        await this.getHistoricalPricesForPeriodWithCoinId(
          coingeckoIdMap,
          startDate.getTime() / 1000,
          endDate.getTime() / 1000,
        );
      // Process each day in the period
      for (
        let d = new Date(startDate);
        d < endDate;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const date = new Date(d);
        const dateStr = date.toISOString().split('T')[0];
        const ts = Math.floor(date.getTime() / 1000);
        const price = this.calculateIndexPrice(
          currentQuantities,
          dailyTokenPrices,
          ts,
        );
        if (price === null) continue;
        lastKnownPrice = Number(price.toFixed(2));

        historicalData.push({
          name: indexData?.name || '',
          date: new Date(ts * 1000),
          price: lastKnownPrice,
          value: lastKnownPrice,
          quantities: currentQuantities,
        });

        await this.storeDailyPrice(
          indexId,
          dateStr,
          lastKnownPrice,
          currentQuantities,
        );
      }

      const formattedAssetPrices = Object.entries(currentQuantities).map(
        ([symbol, quantity]) => {
          const startPrice = dailyTokenPrices[symbol]?.[0]?.price;
          const endPrice =
            dailyTokenPrices[symbol]?.[dailyTokenPrices[symbol].length - 1]
              ?.price || startPrice;

          return {
            asset: symbol,
            startPrice: startPrice?.toFixed(4) || '0.0000', // Handle undefined
            endPrice: endPrice?.toFixed(4) || '0.0000', // Handle undefined
            quantity: quantity, // Include quantity if needed
          };
        },
      );

      result.push({
        index: indexData?.name,
        indexId,
        rebalanceDate: startDate,
        indexPrice: lastKnownPrice.toFixed(2),
        weights: JSON.stringify(rebalance.weights),
        assetPrices: JSON.stringify(formattedAssetPrices),
        // quantities: JSON.stringify(currentQuantities),
      });
    }

    return result;
  }

  async getAssetPriceChanges(
    coingeckoIdMap: Record<string, string>,
    startTimestamp: number,
    endTimestamp: number,
    symbols: string[],
  ) {
    const result: Record<string, { startPrice: number; endPrice: number }> = {};

    for (const symbol of symbols) {
      const coingeckoId = coingeckoIdMap[symbol];
      if (!coingeckoId) continue;

      // Get price at start of period
      const startPrice =
        await this.coinGeckoService.getOrFetchTokenPriceAtTimestamp(
          coingeckoId,
          symbol,
          startTimestamp,
        );

      // Get price at end of period
      const endPrice =
        await this.coinGeckoService.getOrFetchTokenPriceAtTimestamp(
          coingeckoId,
          symbol,
          endTimestamp,
        );

      result[symbol] = {
        startPrice: startPrice || 0,
        endPrice: endPrice || startPrice || 0,
      };
    }

    return result;
  }

  async getRebalancedData(indexId: number): Promise<any[]> {
    // Fetch rebalance events from PostgreSQL
    const rebalanceEvents = await this.dbService
      .getDb()
      .select({
        timestamp: rebalances.timestamp,
        weights: rebalances.weights,
        prices: rebalances.prices,
      })
      .from(rebalances)
      .where(eq(rebalances.indexId, indexId.toString()))
      .orderBy(desc(rebalances.timestamp)); // Newest first to match original logic

    // Process events
    const reversedEvents = rebalanceEvents
      .map((event) => {
        const weights = JSON.parse(event.weights) as [string, number][];
        const prices = event.prices as Record<string, number>;

        // Calculate index price using the same method as historical data
        const price = weights.reduce((sum, [token, weight]) => {
          const tokenPrice = prices[token] || 0;
          return sum + tokenPrice * weight;
        }, 0);

        return {
          timestamp: Number(event.timestamp),
          date: new Date(Number(event.timestamp) * 1000),
          price: price / 1e6, // Maintain same scaling as original
          weights: weights,
          prices: prices,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Reverse sort (newest first)

    // Deduplicate by date (keeping latest)
    const eventsByDate = new Map<string, any>();
    reversedEvents.forEach((event) => {
      const dateKey = event.date.toISOString().split('T')[0];
      eventsByDate.set(dateKey, event);
    });

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

  private async getHistoricalPricesForPeriodWithCoinId(
    coinIdMap: Record<string, string>, // { [symbol]: coinId }
    startTimestamp: number,
    endTimestamp: number,
  ): Promise<Record<string, Array<{ timestamp: number; price: number }>>> {
    const result: Record<
      string,
      Array<{ timestamp: number; price: number }>
    > = {};
    const coinIds = Object.values(coinIdMap);

    if (coinIds.length === 0) {
      return {};
    }

    // 1. Get all available historical prices for the period
    const allPrices = await this.dbService
      .getDb()
      .select()
      .from(historicalPrices)
      .where(
        and(
          inArray(historicalPrices.coinId, coinIds),
          gte(historicalPrices.timestamp, startTimestamp - 86400 * 90), // Include 30 days before for nearest lookup
          lte(historicalPrices.timestamp, endTimestamp + 86400 * 90),
        ),
      )
      .orderBy(asc(historicalPrices.timestamp));

    // 2. Group prices by coinId
    const pricesByCoin: Record<
      string,
      Array<{ timestamp: number; price: number }>
    > = {};
    for (const priceRecord of allPrices) {
      const coinId = priceRecord.coinId;
      if (!pricesByCoin[coinId]) {
        pricesByCoin[coinId] = [];
      }
      pricesByCoin[coinId].push({
        timestamp: priceRecord.timestamp,
        price: priceRecord.price,
      });
    }

    // 3. Generate daily prices for each coin
    for (const coinId of coinIds) {
      const coinPrices = pricesByCoin[coinId] || [];
      if (coinPrices.length === 0) continue;

      result[coinId] = [];
      const priceTimestamps = coinPrices.map((p) => p.timestamp);

      // Generate each day in the period
      for (let ts = startTimestamp; ts <= endTimestamp; ts += 86400) {
        const utcDate = new Date(ts * 1000);
        utcDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
        const dayTimestamp = Math.floor(utcDate.getTime() / 1000);

        // Find the closest price (before or equal to this day)
        const nearestPrice = this.findNearestPrice(coinPrices, dayTimestamp);
        if (nearestPrice) {
          result[coinId].push({
            timestamp: dayTimestamp,
            price: nearestPrice.price,
          });
        }
      }
    }

    return result;
  }

  private findNearestPrice(
    prices: Array<{ timestamp: number; price: number }>,
    targetTimestamp: number,
  ): { timestamp: number; price: number } | null {
    if (prices.length === 0) return null;

    // Find the most recent price at or before the target timestamp
    let nearest: any = null;
    let minDiff = Infinity;

    for (const price of prices) {
      const diff = targetTimestamp - price.timestamp;
      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        nearest = price;
      }
    }

    // If no price before target, use the first available price
    return nearest || prices[0];
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
        .replace(/^bg\./, '')
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

  // private calculateIndexPrice(
  //   weights: Weight[],
  //   tokenPriceHistories: Record<string, Array<[number, number]>>,
  //   dateStr: string,
  // ): number | null {
  //   const totalWeight = weights.reduce((acc, [, w]) => acc + w, 0);
  //   let priceSum = 0;
  //   let valid = false;

  //   for (const [symbol, weight] of weights) {
  //     const prices = tokenPriceHistories[symbol];
  //     if (!prices) continue;

  //     const tokenPrice = this.getPriceAtDate(prices, dateStr);
  //     if (!tokenPrice) continue;

  //     priceSum += (weight / totalWeight) * tokenPrice;
  //     valid = true;
  //   }

  //   return valid ? priceSum : null;
  // }

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
    const indexMetadata: Record<
      string,
      { category: string; assetClass: string }
    > = {
      SY100: {
        category: 'Top 100 Market-Cap Tokens',
        assetClass: 'Cryptocurrencies',
      },
      SYL2: { category: 'Layer-2', assetClass: 'Cryptocurrencies' },
      SYAI: {
        category: 'Artificial Intelligence',
        assetClass: 'Cryptocurrencies',
      },
      SYME: { category: 'Meme Tokens', assetClass: 'Cryptocurrencies' },
      SYDF: {
        category: 'Decentralized Finance (DeFi)',
        assetClass: 'Cryptocurrencies',
      },
      SYAZ: {
        category: 'Andreessen Horowitz (a16z) Portfolio',
        assetClass: 'Cryptocurrencies',
      },
    };
    // Assuming the index count is available via a contract function
    for (let indexId = 21; indexId <= 27; indexId++) {
      if (indexId === 26) continue;
      // Fetch index data
      const indexData = await this.getIndexDataFromFile(indexId);
      // const weights = await this.indexRegistry.curatorWeights(
      //   indexId,
      //   lastWeightUpdateTimestamp,
      // );
      // const tokenLists = this.indexRegistryService.decodeWeights(weights);

      const result = await this.dbService
        .getDb()
        .select()
        .from(tempRebalances)
        .where(eq(tempRebalances.indexId, indexId.toString()))
        .orderBy(desc(tempRebalances.timestamp))
        .limit(1);

      const tokenLists = JSON.parse(result[0].weights);
      const tokenSymbols = tokenLists.map(([token, weight]) => token);
      // Fetch collateral (logos) from token symbols (weights) related to the index
      const logos = await this.getLogosForSymbols(tokenSymbols);

      // Fetch Total Supply for the ERC20 contract (assuming you have a way to get ERC20 contract address for the index)
      const USDValueOfUSDC =
        await this.coinGeckoService.getUSDCUSDPrice('usd-coin');
      const totalSupply = await this.getTotalSupplyForIndex(
        indexData?.name || '',
      );

      const totalSupplyUSD = USDValueOfUSDC * Number(totalSupply);

      // Calculate YTD return (you might need to fetch historical prices for this)
      let ytdReturn = await this.calculateYtdReturn(indexId);

      // Add calculations for other periods (similar to calculateYtdReturn)
      const oneYearReturn = await this.calculatePeriodReturn(indexId, 365);
      const threeYearReturn = await this.calculatePeriodReturn(
        indexId,
        365 * 3,
      );
      const fiveYearReturn = await this.calculatePeriodReturn(indexId, 365 * 5);
      const tenYearReturn = await this.calculatePeriodReturn(indexId, 365 * 10);

      const ratings = await this.calculateRatings(indexId);

      ytdReturn = Math.floor(ytdReturn * 100) / 100;
      const inceptionDate = await this.getInceptionDateForIndex(indexId);

      // Get category and assetClass from the predefined metadata
      const { category, assetClass } = indexMetadata[
        indexData?.symbol || ''
      ] || {
        category: 'General Cryptocurrencies',
        assetClass: 'Cryptocurrencies',
      };

      indexList.push({
        indexId,
        name: indexData?.name || '',
        ticker: indexData?.symbol || '',
        curator: process.env.OTC_CUSTODY_ADDRESS!,
        totalSupply: Number(totalSupply),
        totalSupplyUSD,
        ytdReturn,
        collateral: logos,
        managementFee: Number(ethers.parseUnits('2', 18)) / 1e18, // Assuming fee is in the smallest unit
        assetClass,
        category,
        inceptionDate: inceptionDate ? inceptionDate : 'N/A',
        performance: {
          ytdReturn,
          oneYearReturn,
          threeYearReturn,
          fiveYearReturn,
          tenYearReturn,
        },
        ratings,
      });
    }
    indexList.sort((a, b) => a.indexId - b.indexId);
    return indexList;
  }

  private async calculatePeriodReturn(
    indexId: number,
    days: number,
  ): Promise<number> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2); // Similar to YTD calculation
    endDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const endPrice = await this.getPriceForDate(indexId, endDate.getTime());
    const startPrice = await this.getPriceForDate(indexId, startDate.getTime());

    if (!startPrice || startPrice === 0) return 0;
    return (((endPrice ? endPrice : 0) - startPrice) / startPrice) * 100;
  }

  // Method to calculate ratings (example implementation)
  private async calculateRatings(indexId: number): Promise<FundRating> {
    // Implement your actual rating logic here
    // This is just a placeholder example
    return {
      overallRating: 'A+',
      expenseRating: 'B',
      riskRating: 'C+',
    };
  }

  async getInceptionDateForIndex(indexId: number) {
    const priceRow = await this.dbService
      .getDb()
      .select()
      .from(dailyPrices)
      .where(eq(dailyPrices.indexId, indexId.toString()))
      .orderBy(asc(dailyPrices.date))
      .limit(1);

    if (priceRow[0]) {
      return priceRow[0].date;
    }
    return null;
  }

  async getPriceForDate(
    indexId: number,
    targetDate: number,
  ): Promise<number | null> {
    const priceRow = await this.dbService
      .getDb()
      .select()
      .from(dailyPrices)
      .where(
        and(
          eq(dailyPrices.indexId, indexId.toString()),
          eq(
            dailyPrices.date,
            new Date(targetDate).toISOString().split('T')[0],
          ),
        ),
      )
      .orderBy(desc(dailyPrices.date))
      .limit(1);
    return priceRow[0] && priceRow[0].price ? priceRow[0].price : null;
    // 1. Fetch the most recent rebalance before target date from DB
    // const applicableRebalance = await this.dbService
    //   .getDb()
    //   .select()
    //   .from(rebalances)
    //   .where(
    //     and(
    //       eq(rebalances.indexId, indexId.toString()),
    //       lte(rebalances.timestamp, Math.floor(targetDate / 1000)),
    //     ),
    //   )
    //   .orderBy(desc(rebalances.timestamp))
    //   .limit(1);

    // if (!applicableRebalance.length) return null;

    // const rebalanceData = applicableRebalance[0];

    // // Parse weights from DB (stored as JSON string)
    // const weights: [string, number][] = JSON.parse(rebalanceData.weights);

    // // 2. Get price data for the target date
    // const targetTimestamp = Math.floor(targetDate / 1000);
    // const uniqueSymbols = [...new Set(weights.map((w) => w[0]))];
    // const coingeckoIdMap = await this.mapToCoingeckoIds(uniqueSymbols);

    // const tokenPrices = await this.getHistoricalPricesForPeriod(
    //   coingeckoIdMap,
    //   targetTimestamp,
    //   targetTimestamp,
    // );

    // // 3. Calculate index price
    // return this.calculateIndexPriceFromDb(
    //   weights,
    //   tokenPrices,
    //   targetTimestamp,
    // );
  }

  async getLogosForSymbols(
    symbols: string[],
    maxResults: number = 5, // Default to 5 API calls
  ): Promise<{ name: string; logo: string }[]> {
    // Step 1: Prepare all symbols (trim "bi." and quote assets)
    const processedSymbols = symbols.map((symbol) => ({
      original: symbol,
      cleaned: symbol
        .replace(/^bi\./, '')
        .replace(/(USDT|USDC)$/i, '')
        .toUpperCase(),
    }));

    // Step 2: Only fetch CoinGecko IDs for the first `maxResults` symbols
    const symbolsToFetch = symbols.slice(0, maxResults);
    const coingeckoIdMap = await this.mapToCoingeckoIds(symbolsToFetch);

    // Step 3: Fetch logos only for the first `maxResults` symbols
    const apiResults = await Promise.all(
      symbolsToFetch.map(async (symbol) => {
        const id = coingeckoIdMap[symbol];
        if (!id) return { name: symbol, logo: '' };

        const data = await this.coinGeckoService.getCoinData(`/coins/${id}`);
        return {
          name: processedSymbols.find((s) => s.original === symbol)!.cleaned,
          logo: data?.image?.thumb || '',
        };
      }),
    );

    // Step 4: Combine results (API results + empty placeholders for the rest)
    return processedSymbols.map((symbol, index) => {
      if (index < maxResults) {
        return apiResults[index]; // Return API result for first 5
      }
      return {
        name: symbol.cleaned,
        logo: '', // Empty for symbols beyond maxResults
      };
    });
  }

  async getTotalSupplyForIndex(name: string): Promise<string> {
    const rawData = await fs.readFile(this.INDEX_LIST_PATH, 'utf8');
    this.indexes = JSON.parse(rawData);
    const index = this.indexes.find((index) => index.name === name);
    if (!index || !index.address) return '0';

    const indexToken = new ethers.Contract(
      index.address,
      ['function totalSupply() view returns (uint256)'],
      this.provider,
    );

    const totalSupply = await indexToken.totalSupply();
    return Number(ethers.formatUnits(totalSupply, 6)).toFixed(2); // Use actual decimals
  }

  // async getTotalSupplyForIndex(name: string): Promise<string> {
  //   const rawData = await fs.readFile(this.INDEX_LIST_PATH, 'utf8');
  //   this.indexes = JSON.parse(rawData);
  //   const index = this.indexes.find((index) => index.name === name);
  //   if (!index || !index.address) return '0';

  //   // USDC contract (assumes 6 decimals)
  //   const usdcToken = new ethers.Contract(
  //     process.env.USDC_ADDRESS_IN_BASE || '',
  //     ['function balanceOf(address) view returns (uint256)'],
  //     this.provider,
  //   );
  //   console.log(usdcToken)
  //   const balance = await usdcToken.balanceOf(index.address);
  //   return Number(ethers.formatUnits(balance, 6)).toFixed(2);
  // }

  async calculateYtdReturn(indexId: number): Promise<number> {
    const previousDay = new Date();
    previousDay.setDate(previousDay.getDate() - 2); // Go back 1 day
    previousDay.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC

    const jan1 = new Date(new Date().getFullYear(), 0, 1).setUTCHours(
      0,
      0,
      0,
      0,
    );
    const latestPrice = await this.getPriceForDate(
      indexId,
      previousDay.getTime(),
    );
    const jan1Price = await this.getPriceForDate(indexId, jan1);
    if (!jan1Price || jan1Price === 0) return 0;
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

  async fetchVaultAssets(indexId: number): Promise<VaultAsset[]> {
    // 1. Get latest rebalance data
    const rebalance = await this.dbService
      .getDb()
      .query.tempRebalances.findFirst({
        where: eq(tempRebalances.indexId, indexId.toString()),
        orderBy: desc(tempRebalances.timestamp),
      });

    if (!rebalance) {
      console.log(`No rebalance found for index ${indexId}`);
      return []; // Return empty array if no rebalance found
    }

    // 2. Get latest daily prices with quantities
    const latestDailyPrice = await this.dbService
      .getDb()
      .query.dailyPrices.findFirst({
        where: eq(dailyPrices.indexId, indexId.toString()),
        orderBy: desc(dailyPrices.date),
      });

    const weights = JSON.parse(rebalance.weights) as [string, number][];

    // First, safely parse or normalize the coins data
    let coins: Array<[string, number]>;
    if (typeof rebalance.coins === 'string') {
      try {
        coins = JSON.parse(rebalance.coins) as Array<[string, number]>;
      } catch (e) {
        throw new Error(`Invalid coins JSON: ${rebalance.coins}`);
      }
    } else if (Array.isArray(rebalance.coins)) {
      coins = rebalance.coins as Array<[string, number]>;
    } else {
      // If it's an object, convert to array of entries
      coins = Object.entries(rebalance.coins as Record<string, number>);
    }

    const uniqueIds = [
      ...new Set(coins.map(([coinId]) => coinId.toLowerCase())),
    ];

    // Fetch market data
    const { marketData } = await this.fetchMarketData(uniqueIds);

    // Parse quantities if they exist
    const quantities = latestDailyPrice?.quantities
      ? typeof latestDailyPrice.quantities === 'string'
        ? JSON.parse(latestDailyPrice.quantities)
        : latestDailyPrice.quantities
      : {};

    // 3. Get or create categories
    const assets = await Promise.all(
      coins.map(async ([coinId, weight], idx) => {
        if (!marketData) return null;

        const coinData = marketData.find((c) => c.id === coinId);
        if (!coinData) return null;

        const sector = await this.coinGeckoService.getOrCreateCategory(coinId);
        const symbol = coinData.symbol?.toLowerCase?.();
        if (!symbol) return null;

        const listingEntry = weights.find(([pair]) =>
          pair.toLowerCase().includes(symbol),
        );
        const listing = listingEntry?.[0].split('.')[0] || symbol;

        return {
          id: idx + 1,
          ticker: coinData.symbol
            .replace(/USDT$/, '')
            .replace(/USDC$/, '')
            .toUpperCase(),
          pair: listingEntry?.[0].split('.')[1] || symbol,
          listing,
          assetname: coinData?.name || coinData.symbol,
          sector,
          market_cap: coinData?.market_cap || 0,
          weights: (weight / 100).toFixed(2),
          quantity: quantities[coinId] || 0,
        };
      }),
    );

    // Filter out nulls and sort by market cap
    const sortAssets = assets
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .filter((a) => a.market_cap > 0)
      .sort((a, b) => b.market_cap - a.market_cap);

    return sortAssets;
  }

  async fetchMarketData(coinIds: string[]) {
    const marketData =
      await this.coinGeckoService.fetchCoinGeckoMarkets(coinIds);
    return { marketData };
  }

  async getERC20AddressForIndex(indexId: number): Promise<string | null> {
    const indexTokenAddressMap: Record<number, string> = {
      // 6: '0xac2125c4a6c7e7562cdf605fcac9f32cd9effef2', // replace with actual deployed token addresses
      // 7: '0x8fcf91497b456e63e15837db49411a0cce1ae1d0',
      // 10: '0x9159EE5fa46c50209Af08d1A7AD80232204e57e8',
      // 16: '0xbe80abd52db5e2b304366669040691b1328b238d',
      // 20: '0x532a1D3B2fe237363BA67B3BC14ED559b56cb2D9',
      21: '0x03a4Ba7e555330a0631F457BA55b751785DEe091',
      22: '0xbd37644c8b17a985fed58e172a7e1f8383f7fc2a',
      23: '0x53d33bc96769bb1a22d093f0cf113d98270c7835',
      24: '0x61bda4131ed4c607e430000a5f9da800cbdd6dbd', // 0xd6b8820a14a781a4b2ddeedec2deb5ee898ae426
      25: '0x7C139e501821A9ab4F5a8f9F67c6F2fca3d6dAe4',
      26: '0xb57D8f4A8dC391E04bEA550DD6FbcBa25938162c',
      27: '0x7C5f02830841b874016896C7f702d86298b315A4',
    };
    const address = indexTokenAddressMap[indexId];
    if (!address) {
      console.log(`ERC20 address not found for indexId: ${indexId}`);
      return null;
    }
    return address;
  }

  private async getIndexDataFromFile(indexId: number): Promise<{
    name: string;
    symbol: string;
    address: string;
    indexId: number;
  } | null> {
    try {
      const raw = await fs.readFile(this.INDEX_LIST_PATH, 'utf8');
      const list: Array<any> = JSON.parse(raw);

      const entry = list.find((item) => {
        // allow both number or string "21" matches
        return Number(item.indexId) == indexId;
      });

      if (!entry) return null;

      return {
        name: entry.name,
        symbol: entry.symbol,
        address: entry.address,
        indexId: Number(entry.indexId),
      };
    } catch (err: any) {
      console.error('Failed to read index data from file:', err);
      return null;
    }
  }
}
