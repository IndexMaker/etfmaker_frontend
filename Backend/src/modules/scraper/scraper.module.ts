import { Module } from '@nestjs/common';
import { ListingController } from 'src/api/listing.controller';
import { DbService } from 'src/db/db.service';
import { ScraperService } from './scraperService';

@Module({
  controllers: [ListingController],
  providers: [ScraperService, DbService],
  exports: [ScraperService], // Export if you need to use the service in other modules
})
export class ListingModule {}