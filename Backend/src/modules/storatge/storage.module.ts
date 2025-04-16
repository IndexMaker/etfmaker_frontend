import { Module } from '@nestjs/common';
import { CuratorWeightsService } from './curator-weights.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [CuratorWeightsService],
  exports: [CuratorWeightsService],
})
export class StorageModule {}