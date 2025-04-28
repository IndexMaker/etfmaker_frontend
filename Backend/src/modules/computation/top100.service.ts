import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { BinanceService } from '../data-fetcher/binance.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { compositions, rebalances } from '../../db/schema';
import { ethers } from 'ethers';
import { DbService } from 'src/db/db.service';
import IndexRegistryABI from '../../abis/IndexRegistry.json';
import * as path from 'path'
@Injectable()
export class Top100Service {
  private readonly logger = new Logger(Top100Service.name);
  private readonly fallbackStablecoins = ['usdt', 'usdc', 'dai', 'busd'];
  private readonly fallbackWrappedTokens = ['wbtc', 'weth'];
  private readonly blacklistedCategories = ['Stablecoin', 'Wrapped Token']; // Add more as needed

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  constructor(
    private coinGeckoService: CoinGeckoService,
    private binanceService: BinanceService,
    private indexRegistryService: IndexRegistryService,
    private dbService: DbService,
  ) {
    const rpcUrl = process.env.BASE_SEPOLIA_RPCURL || 'https://mainnet.base.org'; // Use testnet URL for Sepolia if needed
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Configure signer with private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not set in .env');
    }
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  async rebalanceSY100(indexId: number): Promise<void> {
    this.logger.log('Starting SY100 rebalance...');

    try {
      // Load IndexRegistry contract
      const indexRegistry = new ethers.Contract(
        process.env.INDEX_REGISTRY_ADDRESS || ethers.ZeroAddress,
        IndexRegistryABI,
        this.signer,
      );

      // Check if SY100 index exists
      const name = 'SY100';
      const symbol = 'SY100';
      const custodyId = ethers.keccak256(ethers.toUtf8Bytes(name));

      let weightsForContract: [string, number][];
      let etfPrice: number;

      if (!(await this.indexExists(indexId, indexRegistry))) {
        this.logger.log('SY100 does not exist, deploying...');
        // Fetch market cap and weights
        const { weights, price } = await this.computeSY100Weights(indexId);
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
        const { weights, price } = await this.computeSY100Weights(indexId);
        weightsForContract = weights;
        etfPrice = price;
      }

      // Update smart contract
      await this.indexRegistryService.setCuratorWeights(
        indexId,
        weightsForContract,
        Math.floor(etfPrice * 1e6),
        Math.floor(Date.now() / 1000),
        84532,
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
  ): Promise<{ weights: [string, number][]; price: number }> {
    const marketCaps = await this.coinGeckoService.getMarketCap(200);
    const binanceTokens = new Set(await this.binanceService.getListedTokens());
    const eligibleTokens: any[] = [];
    for (const coin of marketCaps) {
      if (eligibleTokens.length >= 100) break;
      if (!binanceTokens.has(coin.symbol.toUpperCase())) continue;

      const categories = await this.coinGeckoService.getCategories(coin.id);
      const isBlacklisted = categories.some((c) =>
        this.blacklistedCategories.includes(c),
      );
      const isAllowedStablecoin = this.fallbackStablecoins.includes(coin.id);
      const isAllowedWrappedToken = this.fallbackWrappedTokens.includes(
        coin.id,
      );

      if (!isBlacklisted || !isAllowedStablecoin || !isAllowedWrappedToken) {
        eligibleTokens.push(coin);
      } else {
        this.logger.warn(
          `Excluded ${coin.id} (categories: ${categories.join(', ')})`,
        );
      }
    }

    if (eligibleTokens.length < 100) {
      this.logger.warn(
        `Only ${eligibleTokens.length} eligible tokens found for Top 100 index`,
      );
      const fallbackTokens = await this.getFallbackTokens();
      for (const coin of fallbackTokens) {
        if (eligibleTokens.length >= 100) break;
        if (!eligibleTokens.some((t) => t.id === coin.id)) {
          eligibleTokens.push(coin);
        }
      }
    }

    const weights = eligibleTokens.map(() => 100);
    const tokenAddresses = eligibleTokens.map((coin) => coin.id);
    const weightsForContract = tokenAddresses.map(
      (addr, i) => [addr, weights[i]] as [string, number],
    );

    const prices = eligibleTokens.map((coin) => coin.current_price);
    const etfPrice = prices.reduce(
      (sum, price, i) => sum + price * (weights[i] / 10000),
      0,
    );

    await this.dbService
      .getDb()
      .insert(compositions)
      .values(
        tokenAddresses.map((addr, i) => ({
          indexId: indexId.toString(),
          tokenAddress: addr,
          weight: (weights[i] / 100).toString(),
        })),
      );

    await this.dbService
      .getDb()
      .insert(rebalances)
      .values({
        indexId: indexId.toString(),
        weights: JSON.stringify(weights),
        prices: prices.reduce(
          (obj, p, i) => ({ ...obj, [tokenAddresses[i]]: p }),
          {},
        ),
        timestamp: Math.floor(Date.now() / 1000),
      });

    return { weights: weightsForContract, price: etfPrice };
  }

  async rebalanceSYAZ(indexId: number): Promise<void> {
    console.log('Starting SYAZ rebalance...');
    const indexRegistry = new ethers.Contract(
      process.env.INDEX_REGISTRY_ADDRESS || ethers.ZeroAddress,
      IndexRegistryABI,
      this.signer,
    );

    const name = 'SYAZ';
    const symbol = 'SYAZ';
    const custodyId = ethers.keccak256(ethers.toUtf8Bytes(name));

    if (!(await this.indexExists(indexId, indexRegistry))) {
      console.log('SYAZ does not exist, deploying...');
      const { weights, etfPrice } = await this.fetchSYAZWeights();
      await this.deployIndex(name, symbol, custodyId, indexId, weights);
      // Update smart contract
      await this.indexRegistryService.setCuratorWeights(
        indexId,
        weights,
        Math.floor(etfPrice * 1e6),
        Math.floor(Date.now() / 1000),
        84532,
      );
    } else {
      console.log('SYAZ exists, updating weights...');
      const { weights, etfPrice } = await this.fetchSYAZWeights();
      // Update smart contract
      await this.indexRegistryService.setCuratorWeights(
        indexId,
        weights,
        Math.floor(etfPrice * 1e6),
        Math.floor(Date.now() / 1000),
        84532,
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

    const artifactPath = path.resolve(__dirname, '../../../../artifacts/contracts/src/ETFMaker/Index.sol/pSymmIndex.json');
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
    );
    this.logger.log(`${name} registered with ID ${indexId}`);

    return deployedAddress;
  }

  async fetchSYAZWeights() {
    try {
      // Fetch a16z Portfolio tokens from CoinGecko
      const a16zTokens = await this.coinGeckoService.getA16zPortfolioTokens();

      const binanceTokens = new Set(
        await this.binanceService.getListedTokens(),
      );

      // Filter for tokens listed on Binance
      const binanceA16ZTokens = a16zTokens.filter((token) =>
        binanceTokens.has(token.symbol.toUpperCase()),
      );

      // Assign equal weights
      const weightPerToken = Math.floor(10000 / binanceA16ZTokens.length);
      const weights = binanceA16ZTokens.map(
        (addr, i) => [addr, weightPerToken] as [string, number],
      );

      // Adjust weights to sum to 10,000
      const totalWeight = weights.reduce((sum, w) => sum + w[1], 0);
      if (totalWeight !== 10000 && weights.length > 0) {
        weights[0][1] += 10000 - totalWeight;
      }

      // Compute ETF price
      const prices = await Promise.all(
        binanceA16ZTokens.map((coin) =>
          this.coinGeckoService.getLivePrice(coin.id),
        ),
      );
      const etfPrice = prices.reduce(
        (sum, price, i) => sum + price * (weightPerToken / 10000),
        0,
      );

      return { weights, etfPrice };
    } catch (error) {
      console.error('Error fetching SYAZ weights:', error);
      throw error;
    }
  }

  // Helper: Check if index exists
  async indexExists(indexId: number, indexRegistry) {
    try {
      console.log(indexRegistry)
      const indexData = await indexRegistry.getIndex(indexId.toString());
      return indexData[0] !== ethers.ZeroAddress;
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

  private async getFallbackTokens() {
    const fallbackIds = [
      ...this.fallbackStablecoins,
      ...this.fallbackWrappedTokens,
    ];
    const tokens: any[] = [];
    for (const id of fallbackIds) {
      try {
        const marketData = await this.coinGeckoService.getMarketCap(1, {
          ids: id,
        });
        if (marketData.length > 0) tokens.push(marketData[0]);
      } catch (error) {
        this.logger.warn(
          `Failed to fetch fallback token ${id}: ${error.message}`,
        );
      }
    }
    return tokens;
  }

  private mapCoinGeckoToToken(coinId: string): string {
    const map: Record<string, string> = {
      bitcoin: '0x...',
      ethereum: '0x...',
    };
    return map[coinId] || '0x0000000000000000000000000000000000000000';
  }
}
