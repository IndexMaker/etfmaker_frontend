import { Module } from '@nestjs/common';
import { IndexRegistryService } from './index-registry.service';
import { IndexService } from './index.service';
import { DbService } from '../../db/db.service';

@Module({
  providers: [IndexRegistryService, IndexService, DbService],
  exports: [IndexRegistryService, IndexService],
})
export class BlockchainModule {}