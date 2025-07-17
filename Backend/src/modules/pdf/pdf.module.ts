import { Module, forwardRef } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { PdfController } from 'src/api/pdf.controller';
import { PdfService } from './pdf.service';
import { EtfPriceService } from '../computation/etf-price.service';
import { IndexRegistryService } from '../blockchain/index-registry.service';
import { CoinGeckoService } from '../data-fetcher/coingecko.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ComputationModule } from '../computation/computation.module';

@Module({
  imports: [
    HttpModule.register({}),
    forwardRef(() => ComputationModule), // Use forwardRef here
  ],
  controllers: [PdfController],
  providers: [PdfService, DbService],
  exports: [PdfService, DbService], // Export if you need to use the service in other modules
})
export class PDFModule {}
