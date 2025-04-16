import { AbiCoder } from 'ethers';
export class CompressionUtil {
  static compressWeights(weights: number[]): string {
    return AbiCoder.defaultAbiCoder().encode(['uint256[]'], [weights]);
  }

  static decompressWeights(data: string): number[] {
    return AbiCoder.defaultAbiCoder().decode(['uint256[]'], data)[0];
  }
}