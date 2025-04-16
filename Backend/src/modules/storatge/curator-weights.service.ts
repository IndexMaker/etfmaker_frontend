import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CompressionUtil } from '../../common/utils/compression.util';

@Injectable()
export class CuratorWeightsService {
  constructor(private indexRegistryService: IndexRegistryService) {}

  async storeWeights(indexId: string, weights: number[], timestamp: number): Promise<void> {
    await this.indexRegistryService.setCuratorWeights(indexId, weights, timestamp);
  }
}