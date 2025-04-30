import { Injectable, Logger } from '@nestjs/common';
import { AbiCoder, ZeroAddress, ethers } from 'ethers';
import * as path from 'path';

@Injectable()
export class IndexRegistryService {
  private readonly logger = new Logger(IndexRegistryService.name);
  private providers: Map<number, ethers.JsonRpcProvider>;
  private contracts: Map<number, ethers.Contract>;
  private wallet: ethers.Wallet | null = null;

  constructor() {
    // Initialize providers for supported chains
    this.providers = new Map([
      [1, new ethers.JsonRpcProvider(process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your_infura_key')],
      [137, new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com')],
      [8453, new ethers.JsonRpcProvider(process.env.BASE_RPCURL || 'https://mainnet.base.org')], // Base
    ]);

    // Initialize contracts
    this.contracts = new Map();
    const indexRegistryAddress = process.env.INDEX_REGISTRY_ADDRESS || '0x77599dFBf5Fd70c5BA8D678Ca5dE3adc2fCa4150';
    const artifactPath = path.resolve(
      __dirname,
      '../../../../artifacts/contracts/src/ETFMaker/IndexRegistry.sol/IndexRegistry.json',
    );
    const IndexRegistryArtifact = require(artifactPath);

    for (const [chainId, provider] of this.providers) {
      this.contracts.set(
        chainId,
        new ethers.Contract(indexRegistryAddress, IndexRegistryArtifact.abi, provider),
      );
    }

    // Initialize wallet for write operations
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey && this.providers.get(8453)) {
      this.wallet = new ethers.Wallet(privateKey, this.providers.get(8453));
      this.contracts.set(
        8453,
        new ethers.Contract(indexRegistryAddress, IndexRegistryArtifact.abi, this.wallet),
      );
    } else {
      this.logger.warn('Private key or Base provider not set; write operations disabled');
    }
  }

  async getIndexData(indexId: number, chainId: number = 8453, timestamp?: number): Promise<{
    tokens: string[];
    weights: number[];
    price: number;
    name: string;
    ticker: string;
    curator: string;
    lastPrice: number;
    lastWeightUpdateTimestamp: number;
    lastPriceUpdateTimestamp: number;
    curatorFee: number;
  }> {
    if (!this.contracts.has(chainId)) {
      this.logger.error(`Unsupported chain: ${chainId}`);
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    try {
      const contract = this.contracts.get(chainId)!;
      const latestTimestamp = timestamp || (await contract.indexDatas(indexId)).lastWeightUpdateTimestamp;

      // Fetch index data and weights
      const [name, ticker, curator, lastPrice, lastWeightUpdateTimestamp, lastPriceUpdateTimestamp, curatorFee] =
        await contract.getIndexDatas(indexId);
      const [curatorWeightsData, curatorPriceData] = await contract.getData(indexId, latestTimestamp, ZeroAddress);

      // Decode bytes weights (assume [address, uint256][] encoding)
      const decodedWeights = AbiCoder.defaultAbiCoder().decode(
        ['tuple(address,uint256)[]'],
        curatorWeightsData
      )[0];
      const tokens = decodedWeights.map((w: [string, ethers.BigNumberish]) => w[0]);
      const weights = decodedWeights.map((w: [string, ethers.BigNumberish]) => w[1]);

      this.logger.log(`Fetched index data for indexId ${indexId} on chain ${chainId}`);
      return {
        tokens,
        weights,
        price: curatorPriceData.toNumber(),
        name,
        ticker,
        curator,
        lastPrice: lastPrice.toNumber(),
        lastWeightUpdateTimestamp: lastWeightUpdateTimestamp.toNumber(),
        lastPriceUpdateTimestamp: lastPriceUpdateTimestamp.toNumber(),
        curatorFee: curatorFee.toNumber(),
      };
    } catch (error) {
      this.logger.error(`Error fetching index data for indexId ${indexId} on chain ${chainId}: ${error.message}`);
      throw error;
    }
  }

  async setCuratorWeights(indexId: number, weights: [string, number][], price: number, timestamp: number, chainId: number = 8453): Promise<void> {
    if (!this.wallet || !this.contracts.has(chainId)) {
      this.logger.error(`Cannot perform write operation: Wallet or chain ${chainId} not configured`);
      throw new Error(`Wallet or chain ${chainId} not configured`);
    }

    try {
      const contract = this.contracts.get(chainId)!;
      // Encode weights as [address, uint256][]
      const encodedWeights = this.encodeWeights(weights);
      const tx = await contract.setCuratorWeights(indexId, timestamp, encodedWeights, price);
      await tx.wait();
      this.logger.log(`Set weights for indexId ${indexId} on chain ${chainId}, tx: ${tx.hash}`);
    } catch (error) {
      this.logger.error(`Error setting weights for indexId ${indexId} on chain ${chainId}: ${error.message}`);
      throw error;
    }
  }

  async registerIndex(name: string, ticker: string, curatorFee: bigint, chainId: number = 8453): Promise<void> {
    if (!this.wallet || !this.contracts.has(chainId)) {
      this.logger.error(`Cannot perform write operation: Wallet or chain ${chainId} not configured`);
      throw new Error(`Wallet or chain ${chainId} not configured`);
    }

    try {
      const contract = this.contracts.get(chainId)!;
      const tx = await contract.registerIndex(name, ticker, curatorFee);
      await tx.wait();
      this.logger.log(`Registered index ${name} (${ticker}) on chain ${chainId}, tx: ${tx.hash}`);
    } catch (error) {
      this.logger.error(`Error registering index ${name} on chain ${chainId}: ${error.message}`);
      throw error;
    }
  }

  private encodeWeights(symbolWeights: [string, number][]): string {
    const bytesArray: Uint8Array[] = [];
  
    for (const [symbol, weight] of symbolWeights) {
      // Manually pad symbol to 12 bytes (or truncate)
      const symbolBytesRaw = ethers.toUtf8Bytes(symbol);
      const symbolBytes = new Uint8Array(12);
      symbolBytes.set(symbolBytesRaw.slice(0, 12)); // truncate/pad to 12 bytes
      bytesArray.push(symbolBytes);
  
      // Pack weight into 2 bytes (uint16)
      const weightBytes = new Uint8Array(2);
      weightBytes[0] = (weight >> 8) & 0xff;
      weightBytes[1] = weight & 0xff;
      bytesArray.push(weightBytes);
    }
  
    // Concatenate and hexlify
    const finalBytes = Uint8Array.from(bytesArray.flatMap(byteArray => Array.from(byteArray)));
    return ethers.hexlify(finalBytes);
  }

  decodeWeights(hexData: string): [string, number][] {
    const bytes = ethers.getBytes(hexData);
    const result: [string, number][] = [];
  
    for (let i = 0; i < bytes.length; i += 14) {
      // Get symbol (12 bytes)
      const symbolBytes = bytes.slice(i, i + 12);
      const symbol = ethers.toUtf8String(symbolBytes).replace(/\0+$/, ''); // Remove padding nulls
  
      // Get weight (2 bytes)
      const weightBytes = bytes.slice(i + 12, i + 14);
      const weight = (weightBytes[0] << 8) | weightBytes[1];
  
      result.push([symbol, weight]);
    }
  
    return result;
  }
}