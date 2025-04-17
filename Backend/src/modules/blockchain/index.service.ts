import { Injectable, Logger } from '@nestjs/common';
import { ethers, formatUnits, hexlify, randomBytes } from 'ethers';
import { DbService } from '../../db/db.service';
import { userActivities } from '../../db/schema';
import IndexABI from '../../abis/Index.json';

@Injectable()
export class IndexService {
  private readonly logger = new Logger(IndexService.name);
  private providers: Map<number, ethers.JsonRpcProvider>;
  private contracts: Map<number, Map<string, ethers.Contract>>;
  private listeners: Map<string, boolean>;

  constructor(private dbService: DbService) {
    // Initialize providers for supported chains
    this.providers = new Map([
      [1, new ethers.JsonRpcProvider(process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your_infura_key')],
      [137, new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com')],
      [8453, new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')], // Base
    ]);

    // Initialize contracts
    this.contracts = new Map();
    this.listeners = new Map();
    for (const chainId of this.providers.keys()) {
      this.contracts.set(chainId, new Map());
    }
  }

  async listenToEvents(indexAddress: string, chainId: number, indexId: number = 1): Promise<void> {
    if (!this.providers.has(chainId)) {
      this.logger.error(`Unsupported chain: ${chainId}`);
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    const listenerKey = `${chainId}:${indexAddress}`;
    if (this.listeners.get(listenerKey)) {
      this.logger.log(`Already listening to events for ${indexAddress} on chain ${chainId}`);
      return;
    }

    const provider = this.providers.get(chainId)!;
    const contract = new ethers.Contract(indexAddress, IndexABI, provider);
    this.contracts.get(chainId)!.set(indexAddress, contract);

    // Listen for Mint events
    contract.on('Mint', async (amount, to, executionPrice, executionTime, frontend, event) => {
      try {
        await this.handleEvent({
          indexId: indexId.toString(),
          userAddress: to,
          action: 'mint',
          amount: formatUnits(amount, 8), // Assume 8 decimals
          txHash: event.transactionHash,
          chainId,
          timestamp: executionTime.toNumber(),
        });
        this.logger.log(`Processed Mint event for ${to} on chain ${chainId}, tx: ${event.transactionHash}`);
      } catch (error) {
        this.logger.error(`Error processing Mint event: ${error.message}`);
      }
    });

    // Listen for Burn events
    contract.on('Burn', async (amount, to, eventChainId, frontend, event) => {
      try {
        const action = eventChainId.toNumber() === 0 ? 'burn' : 'bridge';
        await this.handleEvent({
          indexId: indexId.toString(),
          userAddress: to,
          action,
          amount: formatUnits(amount, 8), // Assume 8 decimals
          txHash: event.transactionHash,
          chainId: eventChainId.toNumber() || chainId, // Use event chainId for bridge
          timestamp: (await event.getBlock()).timestamp,
        });
        this.logger.log(`Processed ${action} event for ${to} on chain ${chainId}, tx: ${event.transactionHash}`);
      } catch (error) {
        this.logger.error(`Error processing Burn event: ${error.message}`);
      }
    });

    this.listeners.set(listenerKey, true);
    this.logger.log(`Started listening to events for ${indexAddress} on chain ${chainId}`);
  }

  private async handleEvent(eventData: {
    indexId: string;
    userAddress: string;
    action: string;
    amount: string;
    txHash: string;
    chainId: number;
    timestamp: number;
  }) {
    try {
      await this.dbService.getDb().insert(userActivities).values({
        indexId: eventData.indexId,
        userAddress: eventData.userAddress,
        action: eventData.action,
        amount: eventData.amount,
        txHash: eventData.txHash,
        chainId: eventData.chainId,
        timestamp: eventData.timestamp,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error storing event ${eventData.action} for ${eventData.userAddress}: ${error.message}`);
      throw error;
    }
  }

  // For testing purposes
  async simulateEvent(
    indexAddress: string,
    chainId: number,
    action: 'mint' | 'burn' | 'bridge',
    userAddress: string,
    amount: string,
    indexId: number = 1,
  ): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const txHash = hexlify(randomBytes(32));
    const eventChainId = action === 'bridge' ? 137 : action === 'burn' ? 0 : chainId; // Simulate bridge to Polygon

    await this.handleEvent({
      indexId: indexId.toString(),
      userAddress,
      action,
      amount,
      txHash,
      chainId: eventChainId,
      timestamp,
    });
    this.logger.log(`Simulated ${action} event for ${userAddress} on chain ${chainId}`);
  }
}