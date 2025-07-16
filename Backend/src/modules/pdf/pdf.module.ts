import { Module } from '@nestjs/common';
import { ListingController } from 'src/api/listing.controller';
import { DbService } from 'src/db/db.service';
import { PdfController } from 'src/api/pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, DbService],
  exports: [PdfService], // Export if you need to use the service in other modules
})
export class PDFModule {}