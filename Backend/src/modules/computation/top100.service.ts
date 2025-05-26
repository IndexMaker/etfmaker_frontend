import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { BinanceService } from '../data-fetcher/binance.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { binanceListings, compositions, rebalances, tempCompositions, tempRebalances } from '../../db/schema';
import { ethers } from 'ethers';
import { DbService } from 'src/db/db.service';
import * as path from 'path';
import { and, eq, inArray, isNull } from 'drizzle-orm';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class Top100Service {
  private readonly logger = new Logger(Top100Service.name);
  private readonly fallbackStablecoins = ['usdt', 'usdc', 'dai', 'busd'];
  private readonly fallbackWrappedTokens = ['wbtc', 'weth'];
  private readonly blacklistedCategories = ['Stablecoins', 'Wrapped-Tokens'];
  private readonly blacklistedToken = ['BNSOL'];

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  constructor(
    private coinGeckoService: CoinGeckoService,
    private binanceService: BinanceService,
    private indexRegistryService: IndexRegistryService,
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
  }

  async rebalanceSY100(
    indexId: number,
    rebalanceTimestamp: number,
  ): Promise<void> {
    this.logger.log(
      `Starting SY100 rebalance at ${new Date(rebalanceTimestamp * 1000).toISOString()}...`,
    );
    try {
      // Load IndexRegistry contract
      const artifactPath = path.resolve(
        __dirname,
        '../../../../artifacts/contracts/src/ETFMaker/IndexRegistry.sol/IndexRegistry.json',
      );
      const IndexRegistryArtifact = require(artifactPath);
      const indexRegistry = new ethers.Contract(
        process.env.INDEX_REGISTRY_ADDRESS || ethers.ZeroAddress,
        IndexRegistryArtifact.abi,
        this.signer,
      );

      // Check if SY100 index exists
      const name = 'SY100';
      const symbol = 'SY100';
      const custodyId = ethers.keccak256(ethers.toUtf8Bytes(name));

      let weightsForContract: [string, number][];
      let etfPrice: number;

      const indexCount = await indexRegistry.indexDatasCount();
      const indexes: any[] = [];

      for (let i = 0; i < Number(indexCount); i++) {
        const indexData = await indexRegistry.getIndexDatas(i.toString());
        if (indexData[2] !== ethers.ZeroAddress) {
          // Only if valid
          indexes.push({
            id: i,
            data: indexData,
          });
        }
      }

      if (!(await this.indexExists(indexId, indexRegistry))) {
        this.logger.log('SY100 does not exist, deploying...');
        // Fetch market cap and weights
        const { weights, price } = await this.computeSY100Weights(
          indexId,
          rebalanceTimestamp,
        );
        weightsForContract = weights;
        etfPrice = price;

        // Deploy new SY100 index
        const deployedAddress = await this.deployIndex(
          name,
          symbol,
          custodyId,
          indexId,
          weightsForContract,
        );
        this.logger.log(`SY100 deployed to: ${deployedAddress}`);
      } else {
        this.logger.log('SY100 exists, updating weights...');
        // Fetch market cap and weights
        const { weights, price } = await this.computeSY100Weights(
          indexId,
          rebalanceTimestamp,
        );
        weightsForContract = weights;
        etfPrice = price;
      }
      return;
      // Update smart contract
      await this.indexRegistryService.setCuratorWeights(
        indexId,
        weightsForContract,
        Math.floor(etfPrice * 1e6),
        rebalanceTimestamp,
        8453,
      );

      this.logger.log(
        `Rebalanced SY100 index with ${weightsForContract.length} tokens`,
      );
    } catch (error) {
      this.logger.error(`Error rebalancing SY100 index: ${error.message}`);
      throw error;
    }
  }

  private async computeSY100Weights(
    indexId: number,
    rebalanceTimestamp: number,
  ): Promise<{ weights: [string, number][]; price: number }> {
    const activePairs = await this.binanceService.fetchTradingPairs();

    // 1. Build Binance tradable tokens map: SYMBOL -> preferred pair (USDC > USDT)
    const tokenToPairMap = new Map<string, string>();
    for (const pair of activePairs) {
      const quote = pair.quoteAsset;
      const base = pair.symbol.replace(quote, '');
      if (quote === 'USDC' || quote === 'USDT') {
        if (!tokenToPairMap.has(base) || quote === 'USDC') {
          tokenToPairMap.set(base, `bi.${pair.symbol}`);
        }
      }
    }

    const db = this.dbService.getDb();

    // 2. Filter only pairs listed before the rebalance timestamp
    const tokenToActualPair = Array.from(tokenToPairMap.entries()).map(
      ([token, pairString]) => {
        const pair = pairString.split('.')[1]; // e.g., BTCUSDT
        return { token, pair };
      },
    );

    const listingPairs = tokenToActualPair.map((entry) => entry.pair);
    const listings = await db
      .select({
        pair: binanceListings.pair,
        timestamp: binanceListings.timestamp,
      })
      .from(binanceListings)
      .where(inArray(binanceListings.pair, listingPairs));

    const listingsMap = new Map<string, number>(
      listings.map((entry) => [entry.pair, entry.timestamp]),
    );

    const filteredTokenToPairMap = new Map<string, string>();
    for (const { token, pair } of tokenToActualPair) {
      const timestampMs = listingsMap.get(pair);
      if (!timestampMs) continue;
      if (Math.floor(timestampMs / 1000) <= rebalanceTimestamp) {
        filteredTokenToPairMap.set(token, `bi.${pair}`);
      }
    }

    if (filteredTokenToPairMap.size === 0) {
      throw new Error('No tokens listed before the rebalancing timestamp.');
    }

    const potentialSymbols = Array.from(filteredTokenToPairMap.keys());

    // 3. Get all matching CoinGecko coins for each symbol
    const allCoinGeckoCoins = await this.coinGeckoService.getAllCoinsList(); // [{ id, symbol, name }]
    const coinMap: Record<string, any[]> = {};
    for (const coin of allCoinGeckoCoins) {
      const sym = coin.symbol.toUpperCase();
      if (!coinMap[sym]) coinMap[sym] = [];
      coinMap[sym].push(coin);
    }

    const flatCoinList = potentialSymbols.flatMap(
      (symbol) => coinMap[symbol] || [],
    );
    const coinIds = [...new Set(flatCoinList.map((c) => c.id))];

    // 4. Fetch market caps for all candidates
    const chunkSize = 250;
    const marketCapResults: any[] = [];
    for (let i = 0; i < coinIds.length; i += chunkSize) {
      const chunk = coinIds.slice(i, i + chunkSize);
      const chunkData = await this.coinGeckoService.getMarketCapsByIds(chunk);
      marketCapResults.push(
        ...chunkData.filter((c) => c.market_cap_rank !== null),
      );
    }

    // 5. Select the top CoinGecko ID by market cap for each symbol
    const selectedBySymbol = new Map<string, any>();
    for (const coin of marketCapResults) {
      const symbol = coin.symbol.toUpperCase();
      const existing = selectedBySymbol.get(symbol);
      if (
        filteredTokenToPairMap.has(symbol) &&
        (!existing || coin.market_cap_rank < existing.market_cap_rank)
      ) {
        selectedBySymbol.set(symbol, coin);
      }
    }

    // 6. Sort by market cap rank and pick top 100
    const topTokens = Array.from(selectedBySymbol.values())
      .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
      .slice(0, 500);

    const eligibleTokens: {
      symbol: string;
      coin: string;
      binancePair: string;
      historical_price: number;
    }[] = [];
    for (const coin of topTokens) {
      const symbolUpper = coin.symbol.toUpperCase();
      const pair = filteredTokenToPairMap.get(symbolUpper);
      if (!pair) continue;

      const categories = await this.coinGeckoService.getCategories(coin.id);
      const isBlacklisted =
        categories.some((c) => this.blacklistedCategories.includes(c)) ||
        this.blacklistedToken.includes(symbolUpper);
      if (isBlacklisted) {
        this.logger.warn(
          `Excluded ${coin.id} (categories: ${categories.join(', ')})`,
        );
        continue;
      }

      await this.coinGeckoService.storeDailyPricesForToken(
        coin.id,
        coin.symbol,
        rebalanceTimestamp,
      );

      const h_price =
        await this.coinGeckoService.getOrFetchTokenPriceAtTimestamp(
          coin.id,
          coin.symbol,
          rebalanceTimestamp,
        );
      if (!h_price) continue;

      eligibleTokens.push({
        symbol: coin.symbol,
        coin: coin.id,
        binancePair: pair,
        historical_price: h_price,
      });

      if (eligibleTokens.length >= 100) break;
    }

    if (eligibleTokens.length === 0) {
      throw new Error(`No eligible tokens found for the given rebalance date.`);
    }

    // 7. Normalize weights
    const numTokens = eligibleTokens.length;
    const baseWeight = Math.floor(10000 / numTokens);
    const remainder = 10000 - baseWeight * numTokens;

    const weightsForContract: [string, number][] = eligibleTokens.map(
      (token, index) => [
        token.binancePair,
        index < remainder ? baseWeight + 1 : baseWeight,
      ],
    );

    const coinsForContract: [string, number][] = eligibleTokens.map(
      (token, index) => [
        token.coin,
        index < remainder ? baseWeight + 1 : baseWeight,
      ],
    );

    const etfPrice = weightsForContract.reduce((sum, [pair, weight]) => {
      const token = eligibleTokens.find((t) => t.binancePair === pair);
      return sum + token!.historical_price * (weight / 10000);
    }, 0);

    console.log(weightsForContract, etfPrice);

    await this.dbService.getDb().transaction(async (tx) => {
      await tx.insert(tempCompositions).values(
        eligibleTokens.map((token, index) => ({
          indexId: indexId.toString(),
          tokenAddress: token.binancePair,
          coin_id: token.coin, // assuming you store `coin.id` from CoinGecko here
          weight: (
            (index < remainder ? baseWeight + 1 : baseWeight) / 100
          ).toString(),
          validUntil: new Date(), // or null if not applicable
          rebalanceTimestamp,
        })),
      );

      await tx.insert(tempRebalances).values({
        indexId: indexId.toString(),
        weights: JSON.stringify(weightsForContract), // e.g., [ [ "bi.BTCUSDT", 100 ] ]
        prices: Object.fromEntries(
          eligibleTokens.map((token) => [
            token.binancePair,
            token.historical_price,
          ]),
        ),
        timestamp: rebalanceTimestamp,
        coins: Object.fromEntries(
          eligibleTokens.map((token, index) => [
            token.coin,
            index < remainder ? baseWeight + 1 : baseWeight,
          ]),
        ),
      });
    });

    return { weights: weightsForContract, price: etfPrice };
  }

  async rebalanceETF(
    etfType:
      | 'andreessen-horowitz-a16z-portfolio'
      | 'layer-2'
      | 'artificial-intelligence'
      | 'meme-token'
      | 'decentralized-finance-defi',
    indexId: number,
    rebalanceTimestamp: number,
  ): Promise<void> {
    console.log(`Starting ${etfType} rebalance...`);
    const artifactPath = path.resolve(
      __dirname,
      '../../../../artifacts/contracts/src/ETFMaker/IndexRegistry.sol/IndexRegistry.json',
    );
    const IndexRegistryArtifact = require(artifactPath);
    const indexRegistry = new ethers.Contract(
      process.env.INDEX_REGISTRY_ADDRESS || ethers.ZeroAddress,
      IndexRegistryArtifact.abi,
      this.signer,
    );

    const name = this.getETFName(etfType);
    const symbol = this.getETFSymbol(etfType);
    const custodyId = ethers.keccak256(ethers.toUtf8Bytes(name));

    if (!(await this.indexExists(indexId, indexRegistry))) {
      this.logger.log(`${symbol} does not exist, deploying...`);
      const { weights, etfPrice } = await this.fetchETFWeights(
        etfType,
        indexId,
        rebalanceTimestamp,
      );

      if (weights && etfPrice) {
        await this.deployIndex(name, symbol, custodyId, indexId, weights);
        console.log(weights, etfPrice);
        await this.indexRegistryService.setCuratorWeights(
          indexId,
          weights,
          Math.floor(etfPrice * 1e6),
          rebalanceTimestamp,
          8453,
        );
      }
    } else {
      this.logger.log(`${symbol} exists, updating weights...`);
      const { weights, etfPrice } = await this.fetchETFWeights(
        etfType,
        indexId,
        rebalanceTimestamp,
      );
      console.log(weights, etfPrice);
      if (weights && etfPrice) {
        await this.indexRegistryService.setCuratorWeights(
          indexId,
          weights,
          Math.floor(etfPrice * 1e6),
          rebalanceTimestamp,
          8453,
        );
      }
    }
  }

  async simulateRebalances(
    startDate: Date,
    now: Date,
    etfType:
      | 'andreessen-horowitz-a16z-portfolio'
      | 'layer-2'
      | 'artificial-intelligence'
      | 'meme-token'
      | 'decentralized-finance-defi',
    indexId: number,
  ) {
    // First get all tokens in the ETF with their listing dates
    const allTokens = await this.coinGeckoService.getPortfolioTokens(etfType);
    const activePairs = await this.binanceService.fetchTradingPairs();

    // Create a map of token symbols to their listing dates
    const tokenListingDates = new Map<string, Date>();

    for (const token of allTokens) {
      const symbolUpper = token.symbol.toUpperCase();
      const pair = activePairs.find(
        (p) =>
          p.symbol.startsWith(symbolUpper) &&
          (p.symbol.endsWith('USDC') || p.symbol.endsWith('USDT')),
      );

      if (pair) {
        const listingTimestamp =
          await this.binanceService.getListingTimestampFromS3(pair.symbol);
        if (listingTimestamp) {
          tokenListingDates.set(token.symbol, new Date(listingTimestamp));
        }
      }
    }

    // Normalize to UTC midnight
    const normalizeToUTCMidnight = (date: Date): Date => {
      const isMidnight =
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0 &&
        date.getUTCMilliseconds() === 0;

      if (isMidnight) return date;

      // Move to next day at 00:00:00 UTC
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate() + 1,
        ),
      );
    };

    // Now find all unique listing dates after our start date
    const listingDates = Array.from(tokenListingDates.values())
      .filter((date) => date >= startDate && date <= now)
      .map(normalizeToUTCMidnight) // <- normalize here
      .sort((a, b) => a.getTime() - b.getTime());

    const rebalanceDates = [
      normalizeToUTCMidnight(startDate), // <- also normalize startDate
      ...listingDates,
    ];

    // Process each rebalance date
    for (const rebalanceDate of rebalanceDates) {
      console.log(
        `Simulating ${etfType} rebalance at ${rebalanceDate.toISOString()}`,
      );
      await this.rebalanceETF(
        etfType,
        indexId,
        Math.floor(rebalanceDate.getTime() / 1000),
      );
    }
  }

  // Helper: Deploy pSymmIndex contract
  async deployIndex(name, symbol, custodyId, indexId, weights) {
    const pSymmAddress = process.env.PSYMM_ADDRESS;
    const indexRegistryAddress = process.env.INDEX_REGISTRY_ADDRESS;
    const collateralToken = process.env.USDC_ADDRESS_IN_BASE;

    if (!pSymmAddress || !indexRegistryAddress || !collateralToken) {
      throw new Error(
        'Missing required environment variables (PSYMM_ADDRESS, INDEX_REGISTRY_ADDRESS, USDC_ADDRESS_IN_BASE)',
      );
    }

    const collateralTokenPrecision = ethers.parseUnits('1', 6); // 1e6 for USDC
    const mintFee = ethers.parseUnits('1', 17);
    const burnFee = ethers.parseUnits('1', 17);
    const managementFee = ethers.parseUnits('2', 18);
    const maxMintPerBlock = ethers.parseUnits('10000', 18);
    const maxRedeemPerBlock = ethers.parseUnits('10000', 18);

    const artifactPath = path.resolve(
      __dirname,
      '../../../../artifacts/contracts/src/ETFMaker/Index.sol/pSymmIndex.json',
    );
    const pSymmIndexArtifact = require(artifactPath);
    const pSymmIndexFactory = new ethers.ContractFactory(
      pSymmIndexArtifact.abi,
      pSymmIndexArtifact.bytecode,
      this.signer,
    );
    const index = await pSymmIndexFactory.deploy(
      pSymmAddress,
      indexRegistryAddress,
      name,
      symbol,
      custodyId,
      collateralToken,
      collateralTokenPrecision,
      mintFee,
      burnFee,
      managementFee,
      maxMintPerBlock,
      maxRedeemPerBlock,
    );

    // Wait for deployment
    await index.waitForDeployment();
    const deployedAddress = await index.getAddress();
    console.log(`${name} deployed to:`, deployedAddress);

    this.logger.log(`${name} deployed to: ${deployedAddress}`);

    // Register the index
    await this.indexRegistryService.registerIndex(
      name,
      symbol,
      managementFee,
      8453,
    );
    this.logger.log(`${name} registered with ID ${indexId}`);

    return deployedAddress;
  }

  async fetchETFWeights(
    etfType: string,
    indexId: number,
    rebalanceTimestamp: number,
  ) {
    try {
      // Get tokens based on ETF type
      let tokens;
      tokens = await this.coinGeckoService.getPortfolioTokens(etfType);

      const activePairs = await this.binanceService.fetchTradingPairs();

      // Create a map of tokens to their preferred pairs (USDC > USDT)
      const tokenToPairMap = new Map<string, string>();
      activePairs.forEach((pair) => {
        const quote = pair.quoteAsset;
        const base = pair.symbol.replace(quote, '');

        // Only consider USDC/USDT pairs
        if (quote === 'USDC' || quote === 'USDT') {
          // Prefer USDC if available, otherwise keep USDT if no USDC exists
          if (!tokenToPairMap.has(base) || quote === 'USDC') {
            tokenToPairMap.set(base, `bi.${pair.symbol}`);
          }
        }
      });

      const eligibleTokens: any[] = [];
      // Filter for tokens listed on Binance
      const binanceTokens = tokens.filter((token) => {
        const symbolUpper = token.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper);

        // Ensure the pair exists AND ends with USDC or USDT
        if (!pair) return false;

        const quoteAsset = pair.endsWith('USDC')
          ? 'USDC'
          : pair.endsWith('USDT')
            ? 'USDT'
            : null;

        return quoteAsset !== null; // Only allow USDC/USDT pairs
      });

      for (const coin of binanceTokens) {
        const symbolUpper = coin.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper);
        if (pair) {
          const listingTimestamp =
            await this.binanceService.getListingTimestampFromS3(
              pair.split('.')[1],
            );
          if (
            !listingTimestamp ||
            listingTimestamp / 1000 > rebalanceTimestamp
          ) {
            this.logger.warn(
              `${coin.id} skipped: listed after rebalancing date.`,
            );
          } else {
            await this.coinGeckoService.storeDailyPricesForToken(
              coin.id,
              coin.symbol,
              rebalanceTimestamp,
            );
            const h_price =
              await this.coinGeckoService.getOrFetchTokenPriceAtTimestamp(
                coin.id,
                coin.symbol,
                rebalanceTimestamp,
              );
            if (h_price) {
              eligibleTokens.push({
                symbol: coin.symbol,
                coin: coin.id,
                binancePair: pair,
                historical_price: h_price,
              });
            }
          }
        }
      }

      if (eligibleTokens.length === 0) {
        this.logger.log(
          `No eligible tokens in ${etfType} portfolio - skipping rebalance`,
        );
        return { weights: null, etfPrice: null };
      }

      // Get current active composition
      const currentComposition = await this.dbService
        .getDb()
        .select()
        .from(tempCompositions)
        .where(
          and(
            eq(tempCompositions.indexId, indexId.toString()),
            isNull(tempCompositions.validUntil),
          ),
        );

      const uniqueTokens = eligibleTokens.reduce((acc, token) => {
        if (!acc.some((t) => t.binancePair === token.binancePair)) {
          acc.push(token);
        }
        return acc;
      }, []);

      // Create a Set of the binancePairs from uniqueTokens
      const currentTokenSet = new Set(uniqueTokens.map((t) => t.binancePair));

      const previousTokenSet = new Set(
        currentComposition.map((c) => c.tokenAddress),
      );

      // Check for new tokens (present in current but not previous)
      const hasNewTokens = [...currentTokenSet].some(
        (t) => !previousTokenSet.has(t),
      );

      // Check for removed tokens (present in previous but not current)
      const hasRemovedTokens = [...previousTokenSet].some(
        (t) => !currentTokenSet.has(t),
      );

      // Skip rebalance if no changes
      if (!hasNewTokens && !hasRemovedTokens && currentComposition.length > 0) {
        this.logger.log(
          `No changes in ${etfType} portfolio - skipping rebalance`,
        );
        return { weights: null, etfPrice: null };
      }

      // Assign equal weights
      const weightPerToken = Math.floor(10000 / eligibleTokens.length);
      const weightsRaw = eligibleTokens.map(() => weightPerToken);

      // Adjust for rounding error
      const totalWeight = weightsRaw.reduce((sum, w) => sum + w, 0);
      if (totalWeight !== 10000) {
        weightsRaw[0] += 10000 - totalWeight;
      }

      const weights: [string, number][] = eligibleTokens.map((token, i) => [
        tokenToPairMap.get(token.symbol.toUpperCase())!,
        weightsRaw[i],
      ]);

      // Compute ETF price
      const prices = await Promise.all(
        eligibleTokens.map((coin) => coin.historical_price),
      );
      const etfPrice = prices.reduce(
        (sum, price, i) => sum + price * (weightPerToken / 10000),
        0,
      );

      // Begin transaction
      await this.dbService.getDb().transaction(async (tx) => {
        // Mark previous compositions as invalid
        if (currentComposition.length > 0) {
          await tx
            .update(tempCompositions)
            .set({ validUntil: new Date() })
            .where(
              and(
                eq(tempCompositions.indexId, indexId.toString()),
                isNull(tempCompositions.validUntil),
              ),
            );
        }

        // Insert new compositions
        await tx.insert(tempCompositions).values(
          weights.map(([tokenAddress, weight]) => ({
            indexId: indexId.toString(),
            tokenAddress,
            weight: (weight / 100).toString(),
            rebalanceTimestamp,
          })),
        );

        // Record rebalance event
        await tx.insert(tempRebalances).values({
          indexId: indexId.toString(),
          weights: JSON.stringify(weights), // e.g., [ [ "bi.BTCUSDT", 100 ] ]
          prices: Object.fromEntries(
            eligibleTokens.map((token) => [
              token.binancePair,
              token.historical_price,
            ]),
          ),
          timestamp: rebalanceTimestamp,
          coins: Object.fromEntries(
            eligibleTokens.map((token, index) => [
              token.coin,
              weights[index][1],
            ]),
          ),
        });
      });

      return { weights, etfPrice };
    } catch (error) {
      console.error(`Error fetching ${etfType} weights:`, error);
      throw error;
    }
  }

  // Helper: Check if index exists
  async indexExists(indexId: number, indexRegistry) {
    try {
      const indexData = await indexRegistry.getIndexDatas(indexId.toString());
      return indexData[2] !== ethers.ZeroAddress;
    } catch (error) {
      return false;
    }
  }

  private getETFName(etfType: string): string {
    const names = {
      'andreessen-horowitz-a16z-portfolio': 'A16Z Crypto Portfolio',
      'layer-2': 'Layer 2 Tokens',
      'artificial-intelligence': 'Artificial Intelligence Tokens',
      'meme-token': 'Meme Tokens',
      'decentralized-finance-defi': 'Decentralized Finance Tokens',
    };
    return names[etfType] || '';
  }

  private getETFSymbol(etfType: string): string {
    const symbols = {
      'andreessen-horowitz-a16z-portfolio': 'SYAZ',
      'layer-2': 'SYL2',
      'artificial-intelligence': 'SYAI',
      'meme-token': 'SYME',
      'decentralized-finance-defi': 'SYDF',
    };
    return symbols[etfType] || '';
  }
}
