import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  async generatePdfFromHtml(template: string, jsonData: any, outputName: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, '../../../../templates', template);
    const fileUrl = `file://${htmlPath}`;

    const jsonString = JSON.stringify(jsonData);

    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().endsWith('.json')) {
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: jsonString
        });
      }
      req.continue();
    });

    await page.goto(fileUrl, { waitUntil: ['networkidle0', 'domcontentloaded'] });
    await page.waitForSelector('#content', { visible: true, timeout: 5000 });

    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${outputName}.pdf`);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();
    return outputPath;
  }

}
