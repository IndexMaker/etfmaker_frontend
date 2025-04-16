import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { DbService } from '../../db/db.service';
import { userActivities } from 'src/db/schema';

// Mock ABI (replace with actual ABI)
const IndexABI = [
  'event Mint(address indexed user, uint256 amount)',
  'event Burn(address indexed user, uint256 amount)',
  'event Bridge(address indexed user, uint256 amount)',
];

@Injectable()
export class IndexService {
  private providers: Map<number, ethers.JsonRpcProvider>;

  constructor(private dbService: DbService) {
    this.providers = new Map([
      [1, new ethers.JsonRpcProvider(process.env.ETH_RPC_URL)],
      [8453, new ethers.JsonRpcProvider(process.env.BASE_RPCURL)],
    ]);
  }

  async listenToEvents(indexAddress: string, chainId: number): Promise<void> {
    const provider = this.providers.get(chainId);
    if (!provider) throw new Error(`Unsupported chain: ${chainId}`);
    const contract = new ethers.Contract(indexAddress, IndexABI, provider);

    contract.on('Mint', async (user, amount, event) => {
      await this.dbService.getDb().insert(userActivities).values({
        indexId: indexAddress,
        userAddress: user,
        action: 'mint',
        amount: amount.toString(),
        txHash: event.transactionHash,
        chainId,
        timestamp: Math.floor(Date.now() / 1000),
      });
    });

    contract.on('Burn', async (user, amount, event) => {
      await this.dbService.getDb().insert(userActivities).values({
        indexId: indexAddress,
        userAddress: user,
        action: 'burn',
        amount: amount.toString(),
        txHash: event.transactionHash,
        chainId,
        timestamp: Math.floor(Date.now() / 1000),
      });
    });

    contract.on('Bridge', async (user, amount, event) => {
      await this.dbService.getDb().insert(userActivities).values({
        indexId: indexAddress,
        userAddress: user,
        action: 'bridge',
        amount: amount.toString(),
        txHash: event.transactionHash,
        chainId,
        timestamp: Math.floor(Date.now() / 1000),
      });
    });
  }
}