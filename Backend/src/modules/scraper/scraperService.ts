import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DbService } from 'src/db/db.service';
import * as cheerio from 'cheerio';
import { announcementsTable, listingsTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
const puppeteer = require('puppeteer-extra');
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PuppeteerExtra } from 'puppeteer-extra';
@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private dbService: DbService;
  private puppeteerExtra: PuppeteerExtra;
  constructor() {
    puppeteer.use(StealthPlugin());
  }

  async scrapeBitget(): Promise<{ listings: any[]; announcements: any[] }> {
    try {
      const listings: any[] = [];
      const announcements: any[] = [];

      // Scrape listings
      const listingBaseUrl =
        'https://www.bitget.com/support/sections/5955813039257';
      const listingData = await this.scrapeBitgetSection(
        listingBaseUrl,
        'listing',
      );
      listings.push(...listingData.listings);
      announcements.push(...listingData.announcements);

      // Scrape delistings
      const delistingBaseUrl =
        'https://www.bitget.com/support/sections/12508313443290';
      const delistingData = await this.scrapeBitgetSection(
        delistingBaseUrl,
        'delisting',
      );
      listings.push(...delistingData.listings);
      announcements.push(...delistingData.announcements);

      return { listings, announcements };
    } catch (error) {
      this.logger.error(`Failed to scrape Bitget: ${error.message}`);
      return { listings: [], announcements: [] };
    }
  }

  async scrapeBitgetSection(
    baseUrl: string,
    type: 'listing' | 'delisting',
  ): Promise<{ listings: any[]; announcements: any[] }> {
    const listings: any[] = [];
    const announcements: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    // Get the last page number
    const firstPageResponse = await axios.get(baseUrl);
    let $ = cheerio.load(firstPageResponse.data);
    const lastPageElement = $('.ant-pagination-next').prev('li');
    lastPage = parseInt(lastPageElement.attr('title') || '1', 10);

    // Iterate through all pages
    for (let page = 1; page <= lastPage; page++) {
      this.logger.log(`Scraping Bitget ${type} page ${page}`);
      const url = `${baseUrl}/${page}`;
      const response = await axios.get(url);
      $ = cheerio.load(response.data);

      // Extract announcement items
      const items = $('section.ArticleList_item_pair__vmMrx');
      console.log(items);
      for (const element of items) {
        const titleElement = $(element).find(
          'a[data-testid="SupportSectionsArticlesText"]',
        );
        const title = titleElement.text().trim();
        const announcementDate = $(element)
          .find('.ArticleList_item_date__nEqio')
          .text()
          .trim();
        const detailUrl = `https://www.bitget.com${titleElement.attr('href')}`;

        // Skip irrelevant announcements
        if (
          type === 'listing' &&
          (!title.toLowerCase().includes('list') ||
            title.toLowerCase().includes('delist'))
        ) {
          continue;
        }
        if (type === 'delisting' && !title.toLowerCase().includes('delist')) {
          continue;
        }

        // Fetch detail page
        const detailResponse = await axios.get(detailUrl);
        const $detail = cheerio.load(detailResponse.data);
        const contentDiv = $detail(
          'div.ArticleDetails_actice_details_main__oIjfu',
        );
        const contentHtml = contentDiv.html()?.trim() || '';

        // Store announcement
        announcements.push({
          title,
          source: 'bitget',
          announceDate: new Date(announcementDate),
          content: contentHtml,
        });

        // Extract tokens and dates
        const contentText = contentDiv.text().trim();
        const dateMatches = contentText.matchAll(
          /(?:on\s+|to\s+)([^,]+,\s+\d{4}(?:,\s+\d{2}:\d{2}\s+\(UTC(?:\+[0-8])?\))?)/gi,
        );
        const pairMatches = contentText.matchAll(/(\w+\/(?:USDT|RLUSD))/gi);

        const dates = Array.from(dateMatches, (m) =>
          m[1].replace(/at\s+/i, '').trim(),
        );
        const pairs = Array.from(pairMatches, (m) => m[1]);

        for (const pair of pairs) {
          const token = pair.split('/')[0];
          const tokenName = token; // Fallback to token if no better name is found

          const listingData = {
            token,
            tokenName,
            announcementDate: new Date(announcementDate).toISOString(),
            source: 'bitget',
            type,
          };

          if (type === 'listing') {
            listingData['listingDate'] = dates[0] || null; // Use first date as listing date
          } else {
            listingData['delistingDate'] = dates[0] || null; // Use first date as delisting date
          }

          listings.push(listingData);
        }
      }
    }

    return { listings, announcements };
  }

  async transformData(listings: any[]): Promise<any[]> {
    const transformed = listings.map((ann) => ({
      token: ann.token,
      tokenName: ann.tokenName,
      listingAnnouncementDate: {
        [ann.source]: ann.type === 'listing' ? ann.announcementDate : null,
      },
      listingDate: {
        [ann.source]: ann.type === 'listing' ? ann.listingDate : null,
      },
      delistingAnnouncementDate: {
        [ann.source]: ann.type === 'delisting' ? ann.announcementDate : null,
      },
      delistingDate: {
        [ann.source]: ann.type === 'delisting' ? ann.delistingDate : null,
      },
    }));

    // Merge announcements for the same token
    const merged = new Map();
    for (const item of transformed) {
      if (merged.has(item.token)) {
        const existing = merged.get(item.token);
        merged.set(item.token, {
          token: item.token,
          tokenName: item.tokenName,
          listingAnnouncementDate: {
            ...existing.listingAnnouncementDate,
            ...item.listingAnnouncementDate,
          },
          listingDate: { ...existing.listingDate, ...item.listingDate },
          delistingAnnouncementDate: {
            ...existing.delistingAnnouncementDate,
            ...item.delistingAnnouncementDate,
          },
          delistingDate: { ...existing.delistingDate, ...item.delistingDate },
        });
      } else {
        merged.set(item.token, item);
      }
    }

    return Array.from(merged.values());
  }

  async scrapeBinance(): Promise<{ listings: any[]; announcements: any[] }> {
    try {
      const listings: any[] = [];
      const announcements: any[] = [];
      let page = 1;
      const pageSize = 10;
      let hasMoreItems = true;

      while (hasMoreItems) {
        this.logger.log(`Scraping Binance listing page ${page}`);
        const url = `https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=${page}&pageSize=${pageSize}&catalogId=48`;

        const response = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
            Accept: 'application/json, text/plain, */*',
            Referer: 'https://www.binance.com/',
            Origin: 'https://www.binance.com',
          },
        });
        const data = response.data;
        if (data.code !== '000000' || !data.success) {
          this.logger.error(
            `Failed to fetch Binance page ${page}: ${data.message}`,
          );
          break;
        }

        const articles = data.data.catalogs[0]?.articles || [];
        if (articles.length === 0) {
          hasMoreItems = false;
          break;
        }

        for (const article of articles) {
          const { title, code, releaseDate } = article;
          // if (
          //   !title.toLowerCase().includes('list') ||
          //   title.toLowerCase().includes('delist')
          // ) {
          //   continue; // Skip non-listing announcements
          // }

          // Fetch detail page
          const detailUrl = `https://www.binance.com/en/support/announcement/detail/${code}`;
          const headers = {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: 'https://www.binance.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
          };

          const detailResponse = await axios.get(detailUrl, { headers });
          const $detail = cheerio.load(detailResponse.data);
          const contentHtml = await this.getBinanceAnnouncementContent(code);
          // const contentText = $detail('.bn-table-content').text().trim();
          // Store announcement
          announcements.push({
            title,
            source: 'binance',
            announceDate: new Date(releaseDate),
            content: contentHtml,
          });

          // Extract token pair and quote asset
          const rows = $detail('.bn-table-content .bn-table-row');
          let pair = '';
          let quoteAsset = '';
          let listingDate = '';
          let tokenName = '';
          console.log(contentHtml);
          return { listings, announcements };
          rows.each((_, row) => {
            const cells = $(row).find('.bn-table-cell');
            const key = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();
            if (
              key.includes('USDⓈ-M Perpetual Contract') ||
              key.includes('Spot Trading Pair')
            ) {
              pair = value; // e.g., HYPEUSDT, HYPEBTC
            } else if (key.includes('Settlement Asset')) {
              quoteAsset = value; // e.g., USDT, BTC, ETH
            } else if (key.includes('Launch Time')) {
              listingDate = value; // e.g., 2025-05-30 10:30 (UTC)
            } else if (key.includes('Underlying Asset')) {
              tokenName =
                value.split('(')[0].trim() || pair.split(quoteAsset)[0]; // e.g., HYPE
            }
          });
          // console.log(pair, quoteAsset)
          if (pair && quoteAsset) {
            const token = pair.replace(quoteAsset, ''); // Extract token by removing quote asset
            listings.push({
              token,
              tokenName: tokenName || token, // Fallback to token if no name found
              announcementDate: new Date(releaseDate).toISOString(),
              listingDate,
              source: 'binance',
              type: 'listing',
            });
            console.log({
              token,
              tokenName: tokenName || token, // Fallback to token if no name found
              announcementDate: new Date(releaseDate).toISOString(),
              listingDate,
              source: 'binance',
              type: 'listing',
            });
          }
        }

        page++;
      }

      return { listings, announcements };
    } catch (error) {
      this.logger.error(`Failed to scrape Binance: ${error.message}`);
      return { listings: [], announcements: [] };
    }
  }

  async getBinanceAnnouncementContent(code: string): Promise<string> {
    const url = `https://www.binance.com/en/support/announcement/detail/${code}`;
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // Use new Headless mode
        executablePath: '/usr/bin/google-chrome-stable', // Explicit path
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Important for Docker/VM
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // May help in resource-constrained environments
          '--disable-gpu',
        ],
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();

      // Set realistic browser fingerprints
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      // Bypass Cloudflare/AWS WAF
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for content to load
      await page.waitForSelector('.bn-table-content', { timeout: 15000 });

      // Extract content
      const content = await page.evaluate(() => {
        return document.querySelector('.bn-table-content')?.innerHTML || '';
      });

      return content;
    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Save listings to database
  async saveListingsToDatabase(data: any[]): Promise<void> {
    try {
      for (const item of data) {
        const existing = await this.dbService
          .getDb()
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.token, item.token))
          .limit(1);

        if (existing.length > 0) {
          await this.dbService
            .getDb()
            .update(listingsTable)
            .set({
              tokenName: item.tokenName,
              listingAnnouncementDate: item.listingAnnouncementDate,
              listingDate: item.listingDate,
              delistingAnnouncementDate: item.delistingAnnouncementDate,
              delistingDate: item.delistingDate,
              updatedAt: new Date(),
            })
            .where(eq(listingsTable.token, item.token));
        } else {
          await this.dbService.getDb().insert(listingsTable).values(item);
        }
      }
      this.logger.log(`Saved ${data.length} listing records to database`);
    } catch (error) {
      this.logger.error(
        `Failed to save listings to database: ${error.message}`,
      );
    }
  }

  // Save announcements to database
  async saveAnnouncementsToDatabase(announcements: any[]): Promise<void> {
    try {
      for (const ann of announcements) {
        const existing = await this.dbService
          .getDb()
          .select()
          .from(announcementsTable)
          .where(eq(announcementsTable.title, ann.title))
          .where(eq(announcementsTable.source, ann.source))
          .where(eq(announcementsTable.announceDate, ann.announceDate))
          .limit(1);

        if (existing.length === 0) {
          await this.dbService.getDb().insert(announcementsTable).values({
            title: ann.title,
            source: ann.source,
            announceDate: ann.announceDate,
            content: ann.content,
          });
        }
      }
      this.logger.log(
        `Saved ${announcements.length} announcement records to database`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save announcements to database: ${error.message}`,
      );
    }
  }
}
