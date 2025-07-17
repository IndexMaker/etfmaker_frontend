import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from 'src/modules/pdf/pdf.service';

@Controller('pdf-generation')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':title/:indexName')
  async generatePdf(@Param('title') title: string, @Param('indexName') indexName: string, @Res() res: Response) {
    const templateFile = `${title}.html`;
    
    if (title === 'factsheet') {
      if (!indexName) return
      
      const jsonPath = path.resolve(__dirname, `../../../templates/${title}.json`);
      if (!fs.existsSync(jsonPath)) {
        return res.status(404).send('JSON data not found.');
      }
      const rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const jsonData = await this.pdfService.updateFactsheetData(indexName, rawJson)
      const pdfPath = await this.pdfService.generatePdfFromHtml(templateFile, jsonData, title, indexName);
    }
    else if (title === 'costs') {

    }

  }

  @Get('/pdfview/:title/:indexName')
  async previewPdf(@Param('title') title: string, @Param('indexName') indexName: string, @Res() res: Response) {
    const pdfPath = path.resolve(process.cwd(), 'output');
    const outputPath = path.join(pdfPath, `${title}-${indexName}.pdf`);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title}-${indexName}.pdf"`
    });
    fs.createReadStream(outputPath).pipe(res);
  }
}
