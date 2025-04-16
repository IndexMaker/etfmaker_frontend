import { Injectable } from '@nestjs/common';
import { ethers, AbiCoder } from 'ethers';
import { CompressionUtil } from '../../common/utils/compression.util';
// Mock ABI (replace with actual ABI from FundMakerFdn repo)
const IndexRegistryABI = [
  'function getIndexData(bytes32) view returns (bytes32)',
  'function setCuratorWeights(bytes32, bytes, uint256)',
];

@Injectable()
export class IndexRegistryService {
  private providers: Map<number, ethers.JsonRpcProvider>;
  private contract: ethers.Contract;

  constructor() {
    this.providers = new Map([
      [1, new ethers.JsonRpcProvider(process.env.ETH_RPC_URL)],
      [137, new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)],
    ]);
    this.contract = new ethers.Contract(
      process.env.INDEX_REGISTRY_ADDRESS!,
      IndexRegistryABI,
      this.providers.get(1),
    );
  }

  // async getIndexData(indexId: string, chainId: number): Promise<{ tokens: string[]; weights: number[] }> {
  //   const provider = this.providers.get(chainId);
  //   if (!provider) throw new Error(`Unsupported chain: ${chainId}`);
  //   const contract = this.contract.connect(provider);
  //   const data = await contract.getIndexData(ethers.utils.id(indexId));
  //   const decoded = AbiCoder.defaultAbiCoder().decode(['address[]', 'uint256[]'], data);
  //   return {
  //     tokens: decoded[0],
  //     weights: decoded[1].map((w: ethers.BigNumberish) => w),
  //   };
  // }

  async setCuratorWeights(indexId: string, weights: number[], timestamp: number): Promise<void> {
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, this.providers.get(1));
    const contract = this.contract.connect(signer);
    const compressedWeights = CompressionUtil.compressWeights(weights);
    // await contract.setCuratorWeights(ethers.utils.id(indexId), compressedWeights, timestamp);
  }
}