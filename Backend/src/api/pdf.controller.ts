import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from 'src/modules/pdf/pdf.service';

@Controller('pdf-generation')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':title')
  async generatePdf(@Param('title') title: string, @Res() res: Response) {
    const templateFile = `${title}.html`;
    const jsonPath = path.resolve(__dirname, `../../../templates/${title}.json`);
    if (!fs.existsSync(jsonPath)) {
      return res.status(404).send('JSON data not found.');
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const pdfPath = await this.pdfService.generatePdfFromHtml(templateFile, jsonData, title);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title}.pdf"`
    });
    fs.createReadStream(pdfPath).pipe(res);
  }

  @Get('/pdfview/:title')
  async previewPdf(@Param('title') title: string, @Res() res: Response) {
    const pdfPath = path.resolve(process.cwd(), 'output');
    const outputPath = path.join(pdfPath, `${title}.pdf`);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title}.pdf"`
    });
    fs.createReadStream(outputPath).pipe(res);
  }
}
