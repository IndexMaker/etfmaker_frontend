import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { BinanceService } from '../data-fetcher/binance.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { compositions, rebalances } from '../../db/schema';
import { ethers } from 'ethers';
import { DbService } from 'src/db/db.service';
import * as path from 'path';
import { and, eq, isNull } from 'drizzle-orm';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class Top100Service {
  private readonly logger = new Logger(Top100Service.name);
  private readonly fallbackStablecoins = ['usdt', 'usdc', 'dai', 'busd'];
  private readonly fallbackWrappedTokens = ['wbtc', 'weth'];
  private readonly blacklistedCategories = ['Stablecoins', 'Wrapped-Tokens']; // Add more as needed

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  constructor(
    private coinGeckoService: CoinGeckoService,
    private binanceService: BinanceService,
    private indexRegistryService: IndexRegistryService,
    private dbService: DbService,
  ) {
    const rpcUrl =
      process.env.BASE_RPCURL || 'https://mainnet.base.org'; // Use testnet URL for Sepolia if needed
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
    const binancePairs = await this.binanceService.fetchTradingPairs();
    const activePairs = binancePairs.filter(
      (pair) => pair.status === 'TRADING',
    );
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
    let page = 1;

    while (eligibleTokens.length < 100) {
      const marketCaps = await this.coinGeckoService.getMarketCap(250, page);

      if (marketCaps.length === 0) break; // No more data to fetch

      for (const coin of marketCaps) {
        if (eligibleTokens.length >= 100) break;
        // Check if token has either USDC or USDT pair
        const symbolUpper = coin.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper);
        if (!pair) continue; // Skip if no USDC/USDT pair
        if (!tokenToPairMap.has(symbolUpper)) continue;

        // ✅ Check if token was listed before rebalancing
        const listingTimestamp =
          await this.binanceService.getListingTimestampFromS3(
            pair.split('.')[1],
          );
        console.log(listingTimestamp, pair.split('.')[1]);
        if (!listingTimestamp || listingTimestamp / 1000 > rebalanceTimestamp) {
          this.logger.warn(
            `${coin.id} skipped: listed after rebalancing date.`,
          );
          continue;
        }

        const categories = await this.coinGeckoService.getCategories(coin.id);
        const isBlacklisted = categories.some((c) =>
          this.blacklistedCategories.includes(c),
        );

        if (!isBlacklisted) {
          eligibleTokens.push({
            symbol: coin.symbol,
            binancePair: pair, // e.g., "bi.BTCUSDC"
            current_price: coin.current_price,
          });
        } else {
          this.logger.warn(
            `Excluded ${coin.id} (categories: ${categories.join(', ')})`,
          );
        }
      }

      page += 1;
    }

    if (eligibleTokens.length < 100) {
      throw new Error(
        `Insufficient eligible tokens for Top 100 index. Only found ${eligibleTokens.length}`,
      );
    }

    const weightsForContract: [string, number][] = eligibleTokens.map(
      (token) => [token.binancePair, 100], // e.g., ["bi.ETHUSDT", 100]
    );

    const etfPrice = eligibleTokens.reduce(
      (sum, token) => sum + token.current_price * (100 / 10000),
      0,
    );

    // Begin transaction
    await this.dbService.getDb().transaction(async (tx) => {
      // Insert new compositions
      await tx.insert(compositions).values(
        weightsForContract.map(([tokenAddress, weight]) => ({
          indexId: indexId.toString(),
          tokenAddress,
          weight: (weight / 100).toString(),
          validUntil: new Date(),
          rebalanceTimestamp,
        }))
      );

      // Record rebalance event
      await tx.insert(rebalances).values({
        indexId: indexId.toString(),
        weights: JSON.stringify(weightsForContract),
        prices: Object.fromEntries(eligibleTokens.map((token, i) => [
          token.binancePair,
          token.current_price
        ])),
        timestamp: rebalanceTimestamp, // Use the passed timestamp
      });
    });
    console.log(etfPrice, weightsForContract);

    return { weights: weightsForContract, price: etfPrice };
  }

  async rebalanceSYAZ(
    indexId: number,
    rebalanceTimestamp: number,
  ): Promise<void> {
    console.log('Starting SYAZ rebalance...');
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
    const indexCount = await indexRegistry.indexDatasCount();
    const indexes: any[] = [];

    for (let i = 0; i < Number(indexCount); i++) {
      const indexData = await indexRegistry.getIndexDatas(i.toString());
      // Only if valid
      indexes.push({
        id: i,
        data: indexData,
      });
    }
    console.log(indexes, indexCount, process.env.INDEX_REGISTRY_ADDRESS);
    const name = 'SYAZ';
    const symbol = 'SYAZ';
    const custodyId = ethers.keccak256(ethers.toUtf8Bytes(name));

    if (!(await this.indexExists(indexId, indexRegistry))) {
      this.logger.log('SYAZ does not exist, deploying...');
      const { weights, etfPrice } = await this.fetchSYAZWeights(
        indexId,
        rebalanceTimestamp,
      );
      await this.deployIndex(name, symbol, custodyId, indexId, weights);
      // Update smart contract
      if (weights && etfPrice) {
        await this.indexRegistryService.setCuratorWeights(
          indexId,
          weights,
          Math.floor(etfPrice * 1e6),
          rebalanceTimestamp,
          8453,
        );
      }
    } else {
      this.logger.log('SYAZ exists, updating weights...');
      const { weights, etfPrice } = await this.fetchSYAZWeights(
        indexId,
        rebalanceTimestamp,
      );

      // Update smart contract
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

  async fetchSYAZWeights(indexId: number, rebalanceTimestamp: number) {
    try {
      // Fetch a16z Portfolio tokens from CoinGecko
      const a16zTokens = await this.coinGeckoService.getA16zPortfolioTokens();

      const binancePairs = await this.binanceService.fetchTradingPairs();
      const activePairs = binancePairs.filter(
        (pair) => pair.status === 'TRADING',
      );
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
      const binanceA16ZTokens = a16zTokens.filter((token) => {
        const symbolUpper = token.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper); // Get the full pair (e.g., BTCUSDC)

        // Ensure the pair exists AND ends with USDC or USDT
        if (!pair) return false;

        const quoteAsset = pair.endsWith('USDC')
          ? 'USDC'
          : pair.endsWith('USDT')
            ? 'USDT'
            : null;

        return quoteAsset !== null; // Only allow USDC/USDT pairs
      });

      binanceA16ZTokens.map(async (coin) => {
        const symbolUpper = coin.symbol.toUpperCase();
        const pair = tokenToPairMap.get(symbolUpper);
        if (pair) {
          // ✅ Check if token was listed before rebalancing
          const listingTimestamp =
            await this.binanceService.getListingTimestampFromS3(
              pair.split('.')[1],
            );
          console.log(listingTimestamp, pair.split('.')[1]);
          if (
            !listingTimestamp ||
            listingTimestamp / 1000 > rebalanceTimestamp
          ) {
            this.logger.warn(
              `${coin.id} skipped: listed after rebalancing date.`,
            );
          } else {
            eligibleTokens.push({
              symbol: coin.symbol,
              binancePair: pair, // e.g., "bi.BTCUSDC"
              current_price: coin.current_price,
            });
          }
        }
      });

      // Get current active composition
      const currentComposition = await this.dbService
        .getDb()
        .select()
        .from(compositions)
        .where(
          and(
            eq(compositions.indexId, indexId.toString()),
            isNull(compositions.validUntil),
          ),
        );

      // Check if we need to rebalance
      const currentTokenSet = new Set(eligibleTokens.map((t) => t.binancePair));
      const previousTokenSet = new Set(
        currentComposition.map((c) => c.tokenAddress),
      );

      const hasNewTokens = [...currentTokenSet].some(
        (t) => !previousTokenSet.has(t),
      );
      const hasRemovedTokens = [...previousTokenSet].some(
        (t) => !currentTokenSet.has(t),
      );

      // Skip rebalance if no changes
      if (!hasNewTokens && !hasRemovedTokens && currentComposition.length > 0) {
        this.logger.log('No changes in A16Z portfolio - skipping rebalance');
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
        eligibleTokens.map(
          (coin) =>
            // this.coinGeckoService.getLivePrice(coin.id),
            coin.current_price,
        ),
      );
      const etfPrice = prices.reduce(
        (sum, price, i) => sum + price * (weightPerToken / 10000),
        0,
      );
      console.log(etfPrice, weights);
      // Begin transaction
      await this.dbService.getDb().transaction(async (tx) => {
        // Mark previous compositions as invalid
        if (currentComposition.length > 0) {
          await tx
            .update(compositions)
            .set({ validUntil: new Date() })
            .where(
              and(
                eq(compositions.indexId, indexId.toString()),
                isNull(compositions.validUntil),
              ),
            );
        }

        // Insert new compositions
        await tx.insert(compositions).values(
          weights.map(([tokenAddress, weight]) => ({
            indexId: indexId.toString(),
            tokenAddress,
            weight: (weight / 100).toString(),
            rebalanceTimestamp,
          })),
        );

        // Record rebalance event
        await tx.insert(rebalances).values({
          indexId: indexId.toString(),
          weights: JSON.stringify(weights),
          prices: Object.fromEntries(
            eligibleTokens.map((token, i) => [
              token.binancePair,
              token.current_price,
            ]),
          ),
          timestamp: rebalanceTimestamp, // Use the passed timestamp
        });
      });
      return { weights, etfPrice };
    } catch (error) {
      console.error('Error fetching SYAZ weights:', error);
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

  async updateIndexWeights(indexId, weights) {
    // const IndexRegistry = await ethers.getContractFactory("IndexRegistry");
    // const indexRegistry = await IndexRegistry.attach(process.env.INDEX_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000");
    // const encodedWeights = encodeWeights(weights);

    // await this.indexRegistryService.setCuratorWeights(
    //   indexId,
    //   encodedWeights,
    //   Math.floor(etfPrice * 1e6),
    //   Math.floor(Date.now() / 1000),
    //   8453,
    // );
    console.log(`Weights updated for index ID ${indexId}`);
  }
}
