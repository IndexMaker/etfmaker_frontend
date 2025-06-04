import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { BinanceService } from '../data-fetcher/binance.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import {
  binanceListings,
  bitgetListings,
  compositions,
  rebalances,
  tempCompositions,
  tempRebalances,
} from '../../db/schema';
import { ethers } from 'ethers';
import { DbService } from 'src/db/db.service';
import * as path from 'path';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { BitgetService } from '../data-fetcher/bitget.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class Top100Service {
  private readonly logger = new Logger(Top100Service.name);
  private readonly fallbackStablecoins = ['usdt', 'usdc', 'dai', 'busd'];
  private readonly fallbackWrappedTokens = ['wbtc', 'weth'];
  private readonly blacklistedCategories = [
    'Stablecoins',
    'Wrapped-Tokens',
    'Bridged-Tokens',
    'Bridged',
    'Cross-Chain',
  ];
  private readonly blacklistedToken = ['BNSOL'];

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  constructor(
    private coinGeckoService: CoinGeckoService,
    private binanceService: BinanceService,
    private bitgetService: BitgetService,
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
    const db = this.dbService.getDb();
    const chunkSize = 250;
    let eligibleTokens: {
      symbol: string;
      coin: string;
      exchangePair: string;
      historical_price: number;
    }[] = [];

    // 1. Prefetch all Binance listings and Bitget pairs
    const [_binanceListings, bitgetPairs] = await Promise.all([
      db
        .select({
          pair: binanceListings.pair,
          timestamp: binanceListings.timestamp,
        })
        .from(binanceListings),

      db
        .select({
          base_asset: bitgetListings.baseAsset,
          quote_asset: bitgetListings.quoteAsset,
        })
        .from(bitgetListings),
    ]);

    // Create lookup maps
    const binanceListingMap = new Map<string, number>();
    for (const listing of _binanceListings) {
      binanceListingMap.set(listing.pair, listing.timestamp);
    }

    const bitgetPairMap = new Map<string, Set<string>>(); // symbol -> Set<quote_asset>
    for (const pair of bitgetPairs) {
      if (!bitgetPairMap.has(pair.base_asset)) {
        bitgetPairMap.set(pair.base_asset, new Set());
      }
      bitgetPairMap.get(pair.base_asset)!.add(pair.quote_asset);
    }
    // 2. Process coins by market cap rank until we get 100
    let page = 1;
    const includedSymbols = new Set<string>();

    const MINIMUM_MARKET_CAP = 100000; // $100k for example
    let continueProcessing = true;
    while (eligibleTokens.length < 100 && continueProcessing) {
      const marketCapChunk = await this.coinGeckoService.getMarketCapsByRank(
        page,
        chunkSize,
      );
      console.log(includedSymbols);
      if (marketCapChunk.length === 0) break;

      for (const coin of marketCapChunk) {
        if (eligibleTokens.length >= 100) break;
        if (coin.market_cap < MINIMUM_MARKET_CAP) {
          continueProcessing = false;
          break;
        }
        if (!coin.market_cap_rank) continue
        const symbolUpper = coin.symbol.toUpperCase();
        if (includedSymbols.has(symbolUpper)) continue;

        // Try to find the best available pair
        let selectedPair: string | null = null;

        // Check Binance USDC
        const binanceUsdcPair = `${symbolUpper}USDC`;
        const binanceUsdcTimestamp = binanceListingMap.get(binanceUsdcPair);
        if (
          binanceUsdcTimestamp &&
          Math.floor(binanceUsdcTimestamp / 1000) <= rebalanceTimestamp
        ) {
          selectedPair = `bi.${binanceUsdcPair}`;
        }

        // Check Binance USDT
        if (!selectedPair) {
          const binanceUsdtPair = `${symbolUpper}USDT`;
          const binanceUsdtTimestamp = binanceListingMap.get(binanceUsdtPair);
          if (
            binanceUsdtTimestamp &&
            Math.floor(binanceUsdtTimestamp / 1000) <= rebalanceTimestamp
          ) {
            selectedPair = `bi.${binanceUsdtPair}`;
          }
        }

        // Check Bitget USDC
        if (!selectedPair && bitgetPairMap.get(symbolUpper)?.has('USDC')) {
          selectedPair = `bg.${symbolUpper}USDC`;
        }

        // Check Bitget USDT
        if (!selectedPair && bitgetPairMap.get(symbolUpper)?.has('USDT')) {
          selectedPair = `bg.${symbolUpper}USDT`;
        }

        if (!selectedPair) continue;

        // Check blacklist
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

        // Get historical price
        const h_price =
          await this.coinGeckoService.getOrFetchTokenPriceAtTimestamp(
            coin.id,
            coin.symbol,
            rebalanceTimestamp,
          );

        if (!h_price) continue;

        await this.coinGeckoService.storeDailyPricesForToken(
          coin.id,
          coin.symbol,
          rebalanceTimestamp,
        );

        eligibleTokens.push({
          symbol: coin.symbol,
          coin: coin.id,
          exchangePair: selectedPair,
          historical_price: h_price,
        });

        includedSymbols.add(symbolUpper);
      }

      page++;
    }

    if (eligibleTokens.length === 0) {
      throw new Error('No eligible tokens found for the given rebalance date.');
    }

    // 3. Normalize weights
    const numTokens = eligibleTokens.length;
    const baseWeight = Math.floor(10000 / numTokens);
    const remainder = 10000 - baseWeight * numTokens;

    const weightsForContract: [string, number][] = eligibleTokens.map(
      (token, index) => [
        token.exchangePair,
        index < remainder ? baseWeight + 1 : baseWeight,
      ],
    );
    console.log(
      Object.fromEntries(
        eligibleTokens.map((token, index) => [
          token.coin,
          index < remainder ? baseWeight + 1 : baseWeight,
        ]),
      ),
    );
    const etfPrice = weightsForContract.reduce((sum, [pair, weight]) => {
      const token = eligibleTokens.find((t) => t.exchangePair === pair);
      return sum + token!.historical_price * (weight / 10000);
    }, 0);

    // 4. Save to database
    await this.dbService.getDb().transaction(async (tx) => {
      // await tx.insert(tempCompositions).values(
      //   eligibleTokens.map((token, index) => ({
      //     indexId: indexId.toString(),
      //     tokenAddress: token.exchangePair,
      //     coin_id: token.coin,
      //     weight: ((index < remainder ? baseWeight + 1 : baseWeight) / 100).toString(),
      //     validUntil: new Date(),
      //     rebalanceTimestamp,
      //   })),
      // );
      await tx
        .insert(tempRebalances)
        .values({
          indexId: indexId.toString(),
          weights: JSON.stringify(weightsForContract),
          prices: Object.fromEntries(
            eligibleTokens.map((token) => [
              token.exchangePair,
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
        })
        .onConflictDoUpdate({
          target: [tempRebalances.indexId, tempRebalances.timestamp],
          set: {
            weights: JSON.stringify(weightsForContract),
            prices: Object.fromEntries(
              eligibleTokens.map((token) => [
                token.exchangePair,
                token.historical_price,
              ]),
            ),
            coins: Object.fromEntries(
              eligibleTokens.map((token, index) => [
                token.coin,
                index < remainder ? baseWeight + 1 : baseWeight,
              ]),
            ),
          },
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

    // if (!(await this.indexExists(indexId, indexRegistry))) {
    //   this.logger.log(`${symbol} does not exist, deploying...`);
    //   const { weights, etfPrice } = await this.fetchETFWeights(
    //     etfType,
    //     indexId,
    //     rebalanceTimestamp,
    //   );

    //   if (weights && etfPrice) {
    //     await this.deployIndex(name, symbol, custodyId, indexId, weights);
    //     console.log(weights, etfPrice);
    //     await this.indexRegistryService.setCuratorWeights(
    //       indexId,
    //       weights,
    //       Math.floor(etfPrice * 1e6),
    //       rebalanceTimestamp,
    //       8453,
    //     );
    //   }
    // } else {
    this.logger.log(`${symbol} exists, updating weights...`);
    const { weights, etfPrice } = await this.fetchETFWeights(
      etfType,
      indexId,
      rebalanceTimestamp,
    );
    console.log(weights, etfPrice);
    if (weights && etfPrice) {
      // await this.indexRegistryService.setCuratorWeights(
      //   indexId,
      //   weights,
      //   Math.floor(etfPrice * 1e6),
      //   rebalanceTimestamp,
      //   8453,
      // );
    }
    // }
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
    // Get all binance listings upfront
    const [_binanceListings, allTokens, activePairs] = await Promise.all([
      this.dbService
        .getDb()
        .select({
          pair: binanceListings.pair,
          timestamp: binanceListings.timestamp,
        })
        .from(binanceListings),
      this.coinGeckoService.getPortfolioTokens(etfType),
      this.binanceService.fetchTradingPairs(),
    ]);

    // Create lookup maps
    const binanceListingMap = new Map<string, number>();
    for (const listing of _binanceListings) {
      binanceListingMap.set(listing.pair, listing.timestamp);
    }

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
        const listingTimestamp = binanceListingMap.get(pair.symbol);
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

    // Process each rebalance date in sequence
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
      // Get all binance listings upfront
      const _binanceListings = await this.dbService
        .getDb()
        .transaction(async (tx) => {
          return tx
            .select({
              pair: binanceListings.pair,
              timestamp: binanceListings.timestamp,
            })
            .from(binanceListings);
        });

      const binanceListingMap = new Map<string, number>();
      for (const listing of _binanceListings) {
        binanceListingMap.set(listing.pair, listing.timestamp);
      }

      // Get tokens based on ETF type
      const tokens = await this.coinGeckoService.getPortfolioTokens(etfType);
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

      const eligibleTokens: {
        symbol: string;
        coin: string;
        binancePair: string;
        historical_price: number;
      }[] = [];

      // Filter for tokens listed on Binance and validate coin_id
      for (const coin of tokens) {
        if (!coin.id || coin.id.trim() === '') {
          this.logger.warn(`Skipping token ${coin.symbol} with empty coin_id`);
          continue;
        }

        const symbolUpper = coin.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper);

        // Ensure the pair exists AND ends with USDC or USDT
        if (!pair || !(pair.endsWith('USDC') || pair.endsWith('USDT'))) {
          continue;
        }

        // Get the Binance pair symbol without the 'bi.' prefix
        const binancePairSymbol = pair.split('.')[1];
        const listingTimestamp = binanceListingMap.get(binancePairSymbol);

        if (!listingTimestamp || listingTimestamp / 1000 > rebalanceTimestamp) {
          this.logger.warn(
            `${coin.id} skipped: listed after rebalancing date.`,
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

        if (h_price) {
          // Check if we already have this symbol in eligibleTokens
          const existingIndex = eligibleTokens.findIndex(
            (t) => t.symbol === coin.symbol,
          );
          if (existingIndex === -1) {
            eligibleTokens.push({
              symbol: coin.symbol,
              coin: coin.id,
              binancePair: pair,
              historical_price: h_price,
            });
          } else {
            // Replace if the new pair is USDC and existing is USDT
            const existingPair = eligibleTokens[existingIndex].binancePair;
            if (pair.endsWith('USDC') && existingPair.endsWith('USDT')) {
              eligibleTokens[existingIndex] = {
                symbol: coin.symbol,
                coin: coin.id,
                binancePair: pair,
                historical_price: h_price,
              };
            }
          }
        }
      }
      // ... rest of the function remains the same ...
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

      // Check for composition changes
      const currentTokenSet = new Set(eligibleTokens.map((t) => t.binancePair));
      const previousTokenSet = new Set(
        currentComposition.map((c) => c.tokenAddress),
      );

      const hasChanges =
        [...currentTokenSet].some((t) => !previousTokenSet.has(t)) ||
        [...previousTokenSet].some((t: string) => !currentTokenSet.has(t));

      if (!hasChanges && currentComposition.length > 0) {
        this.logger.log(
          `No changes in ${etfType} portfolio - skipping rebalance`,
        );
        return { weights: null, etfPrice: null };
      }

      // Calculate equal weights
      const weightPerToken = Math.floor(10000 / eligibleTokens.length);
      const remainder = 10000 - weightPerToken * eligibleTokens.length;
      const weights: [string, number][] = eligibleTokens.map((token, index) => [
        token.binancePair,
        index < remainder ? weightPerToken + 1 : weightPerToken,
      ]);

      // Compute ETF price
      const etfPrice = weights.reduce(
        (sum, [pair, weight], i) =>
          sum + eligibleTokens[i].historical_price * (weight / 10000),
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
          eligibleTokens.map((token, index) => ({
            indexId: indexId.toString(),
            tokenAddress: token.binancePair,
            coin_id: token.coin,
            weight: (weights[index][1] / 100).toString(),
            validUntil: null,
            rebalanceTimestamp,
          })),
        );

        // Record rebalance event using drizzle's native syntax
        await tx
          .insert(tempRebalances)
          .values({
            indexId: indexId.toString(),
            weights: JSON.stringify(weights),
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
          })
          .onConflictDoUpdate({
            target: [tempRebalances.indexId, tempRebalances.timestamp],
            set: {
              weights: JSON.stringify(weights),
              prices: Object.fromEntries(
                eligibleTokens.map((token) => [
                  token.binancePair,
                  token.historical_price,
                ]),
              ),
              coins: Object.fromEntries(
                eligibleTokens.map((token, index) => [
                  token.coin,
                  weights[index][1],
                ]),
              ),
            },
          });
      });

      return { weights, etfPrice };
    } catch (error) {
      this.logger.error(`Error fetching ${etfType} weights:`, error);
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
