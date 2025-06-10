import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DbService } from 'src/db/db.service';
import * as cheerio from 'cheerio';
import { announcementsTable, listingsTable } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';
const puppeteer = require('puppeteer-extra');
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PuppeteerExtra } from 'puppeteer-extra';
import https from 'https';
const { exec } = require('child_process');
@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private puppeteerExtra: PuppeteerExtra;
  constructor(private dbService: DbService) {
    ``;
    puppeteer.use(StealthPlugin());
  }

  async scrapeBitget(): Promise<{ listings: any[]; announcements: any[] }> {
    try {
      const listings: any[] = [];
      const announcements: any[] = [];

      // 1. Fetch Listings
      const listingData = await this.fetchBitgetAnnouncements({
        sectionId: '5955813039257', // Innovation Zone listings
        type: 'listing',
      });
      listings.push(...listingData.listings);
      announcements.push(...listingData.announcements);

      // 2. Fetch Delistings
      const delistingData = await this.fetchBitgetAnnouncements({
        businessType: 70, // Delistings
        type: 'delisting',
      });
      listings.push(...delistingData.listings);
      announcements.push(...delistingData.announcements);

      return { listings, announcements };
    } catch (error) {
      this.logger.error(`Failed to scrape Bitget: ${error.message}`);
      return { listings: [], announcements: [] };
    }
  }

  // wip: using puppeteer
  // async fetchBitgetAnnouncements(params: {
  //   sectionId?: string;
  //   businessType?: number;
  //   type: 'listing' | 'delisting';
  // }): Promise<{ listings: any[]; announcements: any[] }> {
  //   const listings: any[] = [];
  //   const announcements: any[] = [];
  //   let pageNum = 1;
  //   const pageSize = 20;
  //   let hasMore = true;

  //   while (hasMore) {
  //     try {
  //       // Fetch announcement list
  //       const token = process.env.SCRAPER_API_KEY;
  //       const browser = await puppeteer.launch({
  //         headless: true,
  //         args: ['--no-sandbox', '--disable-setuid-sandbox'],
  //       });
  //       const page = await browser.newPage();

  //       // Set realistic browser fingerprints
  //       await page.setUserAgent(
  //         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  //       );
  //       await page.setViewport({ width: 1366, height: 768 });

  //       let response;

  //       try {
  //         // First visit a Bitget page to establish cookies
  //         await page.goto('https://www.bitget.com/', {
  //           waitUntil: 'domcontentloaded',
  //           timeout: 60000,
  //         });

  //         if (params.sectionId) {
  //           // Help Center API
  //           response = await page.evaluate(
  //             async (params, pageNum) => {
  //               const response = await fetch(
  //                 'https://www.bitget.com/v1/cms/helpCenter/content/section/helpContentDetail',
  //                 {
  //                   method: 'POST',
  //                   headers: {
  //                     'Content-Type': 'application/json',
  //                     Origin: 'https://www.bitget.com',
  //                   },
  //                   body: JSON.stringify({
  //                     pageNum: pageNum,
  //                     pageSize: 20,
  //                     params: {
  //                       sectionId: params.sectionId,
  //                       languageId: 0,
  //                       firstSearchTime: Date.now(),
  //                     },
  //                   }),
  //                 },
  //               );
  //               return response.json();
  //             },
  //             params,
  //             pageNum,
  //           );
  //         } else if (params.businessType) {
  //           // Delistings API
  //           response = await page.evaluate(
  //             async (params, pageSize) => {
  //               const response = await fetch(
  //                 'https://www.bitget.com/v1/msg/public/station/pageList',
  //                 {
  //                   method: 'POST',
  //                   headers: {
  //                     'Content-Type': 'application/json',
  //                     Origin: 'https://www.bitget.com',
  //                   },
  //                   body: JSON.stringify({
  //                     pageSize: pageSize,
  //                     openUnread: 1,
  //                     businessType: params.businessType,
  //                     isPre: false,
  //                     lastEndId: null,
  //                     languageType: 0,
  //                   }),
  //                 },
  //               );
  //               return response.json();
  //             },
  //             params,
  //             pageSize,
  //           );
  //         }
  //       } finally {
  //         await browser.close();
  //       }

  //       const items = response?.data?.items || response?.data?.list || [];
  //       if (items.length === 0) {
  //         hasMore = false;
  //         break;
  //       }

  //       // Process each announcement
  //       for (const item of items) {
  //         const contentId = item.contentId || item.id;
  //         if (!contentId) continue;

  //         // Fetch announcement details
  //         const detailResponse = await axios.post(
  //           'https://www.bitget.com/v1/cms/helpCenter/content/get/helpContentDetail',
  //           {
  //             contentId,
  //             languageId: 0,
  //           },
  //         );

  //         const detail = detailResponse.data;
  //         const title = detail.title || item.title;
  //         const contentHtml = detail.content || '';
  //         const publishTime =
  //           detail.showTime || item.unifiedDisplayTime || item.createTime;

  //         // Skip irrelevant announcements
  //         if (
  //           params.type === 'listing' &&
  //           !title.toLowerCase().includes('list')
  //         )
  //           continue;
  //         if (
  //           params.type === 'delisting' &&
  //           !title.toLowerCase().includes('delist')
  //         )
  //           continue;

  //         // Store announcement
  //         announcements.push({
  //           title,
  //           source: 'bitget',
  //           announceDate: new Date(parseInt(publishTime)),
  //           content: contentHtml,
  //         });

  //         // Extract trading pairs (improved regex)
  //         const contentText = cheerio.load(contentHtml).text();
  //         const pairMatches = contentText.matchAll(/(\w+)\/(\w+)/gi);
  //         const dateMatches = contentText.matchAll(
  //           /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\))/gi,
  //         );

  //         const pairs = Array.from(pairMatches, (m) => m[0]);
  //         const dates = Array.from(dateMatches, (m) => m[0]);

  //         // Extract from title if not found in content
  //         if (pairs.length === 0) {
  //           const titlePairs = title.match(/(\w+)\/(\w+)/);
  //           if (titlePairs) pairs.push(titlePairs[0]);
  //         }

  //         // Create listing entries
  //         for (const pair of pairs) {
  //           const [token, quoteAsset] = pair.split('/');
  //           listings.push({
  //             token,
  //             tokenName: token, // Fallback to token symbol
  //             quoteAsset,
  //             announcementDate: new Date(parseInt(publishTime)).toISOString(),
  //             [params.type === 'listing' ? 'listingDate' : 'delistingDate']:
  //               dates[0] || null,
  //             source: 'bitget',
  //             type: params.type,
  //           });
  //         }
  //       }
  //       return { listings, announcements };
  //       pageNum++;
  //     } catch (error) {
  //       this.logger.error(
  //         `Error fetching Bitget ${params.type} page ${pageNum}: ${error}`,
  //       );
  //       hasMore = false;
  //     }
  //   }

  //   return { listings, announcements };
  // }

  //   async fetchBitgetAnnouncements(params: {
  //     sectionId?: string;
  //     businessType?: number;
  //     type: 'listing' | 'delisting';
  //   }): Promise<{ listings: any[]; announcements: any[] }> {
  //     const listings: any[] = [];
  //     const announcements: any[] = [];
  //     let pageNum = 1;
  //     const pageSize = 20;
  //     let hasMore = true;

  //     while (hasMore) {
  //       try {
  //         // Fetch announcement list
  //         const token = process.env.SCRAPER_API_KEY;
  //         let response;
  //         if (params.sectionId) {
  //           response = await axios.post(
  //             'https://www.bitget.com/v1/cms/helpCenter/content/section/helpContentDetail',
  //             JSON.stringify({
  //               pageNum,
  //               pageSize,
  //               params: {
  //                 sectionId: params.sectionId,
  //                 languageId: 0,
  //                 firstSearchTime: Date.now(),
  //               },
  //             }),
  //             {
  //               headers: {
  //                 authority: 'www.bitget.com',
  //                 accept: 'application/json, text/plain, */*',
  //                 'accept-language': 'en-US,en;q=0.9',
  //                 'content-type': 'application/json;charset=UTF-8',
  //                 cookie:
  //                   '_cfuvid=vxo_MtiMQHGfxrmM8_kcDYcMRLaA6j76VxoDJtpcZpo-1749485924510-0.0.1.1-604800000; dy_token=6847d76auo5t1QdD5RtdrNLmkfYmuYGMPWpbc1Q1; __cf_bm=cCHyoDGnYPE1v7D07OQu6mvGwuc4kYmAewHAsXAOxsI-1749539606-1.0.1.1-XzJ9Ed1KXffGwyf4Kt5ptew3Mgu2pT98BRf5ISTmCW9OBBJXMMoJfQDvhJUbsSSAZ_8Mt3iQES9MpyoDyBbf_iq8zojomVSaShcQlPiHPxU; _ga_Z8Q93KHR0F=GS2.1.s1749533759$o9$g1$t1749536160$j60$l0$h0',
  //                 deviceid: 'a9d4da5a7660be59f9adf1fc9de7c52a',
  //                 language: 'en_US',
  //                 locale: 'en_US',
  //                 origin: 'https://www.bitget.com',
  //                 priority: 'u=1, i',
  //                 referer:
  //                   'https://www.bitget.com/support/sections/5955813039257/2',
  //                 'sec-ch-ua':
  //                   '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
  //                 'sec-ch-ua-mobile': '?0',
  //                 'sec-ch-ua-platform': '"Windows"',
  //                 'sec-fetch-dest': 'empty',
  //                 'sec-fetch-mode': 'cors',
  //                 'sec-fetch-site': 'same-origin',
  //                 terminalcode: '5ce00db38c205130d46b42a2b3134ad4',
  //                 terminaltype: '1',
  //                 tm: Date.now().toString(),
  //                 'user-agent':
  //                   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  //                 website: 'mix',
  //               },
  //               httpsAgent: new https.Agent({
  //                 rejectUnauthorized: false,
  //               }),
  //             },
  //           );
  //         } else if (params.businessType) {
  //           // Delistings API
  //           // response = await axios.post(
  //           //   'https://www.bitget.com/v1/msg/public/station/pageList',
  //           //   {
  //           //     pageSize,
  //           //     openUnread: 1,
  //           //     businessType: params.businessType,
  //           //     isPre: false,
  //           //     lastEndId: null,
  //           //     languageType: 0,
  //           //   },
  //           //   {
  //           //     headers: {
  //           //       'User-Agent':
  //           //         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  //           //       Origin: 'https://www.bitget.com',
  //           //       Referer: 'https://www.bitget.com/',
  //           //       cookie: "_cfuvid=vxo_MtiMQHGfxrmM8_kcDYcMRLaA6j76VxoDJtpcZpo-1749485924510-0.0.1.1-604800000; dy_token=6847d76auo5t1QdD5RtdrNLmkfYmuYGMPWpbc1Q1; __cf_bm=cCHyoDGnYPE1v7D07OQu6mvGwuc4kYmAewHAsXAOxsI-1749539606-1.0.1.1-XzJ9Ed1KXffGwyf4Kt5ptew3Mgu2pT98BRf5ISTmCW9OBBJXMMoJfQDvhJUbsSSAZ_8Mt3iQES9MpyoDyBbf_iq8zojomVSaShcQlPiHPxU; _ga_Z8Q93KHR0F=GS2.1.s1749533759$o9$g1$t1749536160$j60$l0$h0",
  //           //     },
  //           //   },
  //           // );
  //           const curlCommand = `
  //   curl -X POST 'https://www.bitget.com/v1/msg/public/station/pageList' \
  //     -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' \
  //     -H 'Origin: https://www.bitget.com' \
  //     -H 'Referer: https://www.bitget.com/' \
  //     -H 'Accept: application/json, text/plain, */*' \
  //     -H 'Accept-Language: en-US,en;q=0.9' \
  //     -H 'Content-Type: application/json' \
  //     -H 'Cookie: _cfuvid=_cfuvid=vxo_MtiMQHGfxrmM8_kcDYcMRLaA6j76VxoDJtpcZpo-1749485924510-0.0.1.1-604800000; dy_token=6847d76auo5t1QdD5RtdrNLmkfYmuYGMPWpbc1Q1; __cf_bm=cCHyoDGnYPE1v7D07OQu6mvGwuc4kYmAewHAsXAOxsI-1749539606-1.0.1.1-XzJ9Ed1KXffGwyf4Kt5ptew3Mgu2pT98BRf5ISTmCW9OBBJXMMoJfQDvhJUbsSSAZ_8Mt3iQES9MpyoDyBbf_iq8zojomVSaShcQlPiHPxU; _ga_Z8Q93KHR0F=GS2.1.s1749533759$o9$g1$t1749536160$j60$l0$h0' \
  //     --data-raw '{
  //       "pageSize": 20,
  //       "openUnread": 1,
  //       "businessType": "DELIST",
  //       "isPre": false,
  //       "lastEndId": null,
  //       "languageType": 0
  //     }' \
  //     --tlsv1.3 --tls-max 1.3 --ciphers DEFAULT@SECLEVEL=1 \
  //     --compressed
  // `;

  //           exec(curlCommand, (error, stdout, stderr) => {
  //             if (error) {
  //               console.error('cURL Error:', error);
  //               return;
  //             }
  //             console.log('Response:', stdout);
  //           });
  //         }

  //         const items = response?.data?.items || response?.data?.list || [];
  //         if (items.length === 0) {
  //           hasMore = false;
  //           break;
  //         }

  //         // Process each announcement
  //         for (const item of items) {
  //           const contentId = item.contentId || item.id;
  //           if (!contentId) continue;

  //           // Fetch announcement details
  //           const detailResponse = await axios.post(
  //             'https://www.bitget.com/v1/cms/helpCenter/content/get/helpContentDetail',
  //             {
  //               contentId,
  //               languageId: 0,
  //             },
  //           );

  //           const detail = detailResponse.data;
  //           const title = detail.title || item.title;
  //           const contentHtml = detail.content || '';
  //           const publishTime =
  //             detail.showTime || item.unifiedDisplayTime || item.createTime;

  //           // Skip irrelevant announcements
  //           if (
  //             params.type === 'listing' &&
  //             !title.toLowerCase().includes('list')
  //           )
  //             continue;
  //           if (
  //             params.type === 'delisting' &&
  //             !title.toLowerCase().includes('delist')
  //           )
  //             continue;

  //           // Store announcement
  //           announcements.push({
  //             title,
  //             source: 'bitget',
  //             announceDate: new Date(parseInt(publishTime)),
  //             content: contentHtml,
  //           });

  //           // Extract trading pairs (improved regex)
  //           const contentText = cheerio.load(contentHtml).text();
  //           const pairMatches = contentText.matchAll(/(\w+)\/(\w+)/gi);
  //           const dateMatches = contentText.matchAll(
  //             /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\))/gi,
  //           );

  //           const pairs = Array.from(pairMatches, (m) => m[0]);
  //           const dates = Array.from(dateMatches, (m) => m[0]);

  //           // Extract from title if not found in content
  //           if (pairs.length === 0) {
  //             const titlePairs = title.match(/(\w+)\/(\w+)/);
  //             if (titlePairs) pairs.push(titlePairs[0]);
  //           }

  //           // Create listing entries
  //           for (const pair of pairs) {
  //             const [token, quoteAsset] = pair.split('/');
  //             listings.push({
  //               token,
  //               tokenName: token, // Fallback to token symbol
  //               quoteAsset,
  //               announcementDate: new Date(parseInt(publishTime)).toISOString(),
  //               [params.type === 'listing' ? 'listingDate' : 'delistingDate']:
  //                 dates[0] || null,
  //               source: 'bitget',
  //               type: params.type,
  //             });
  //           }
  //         }
  //         return { listings, announcements };
  //         pageNum++;
  //       } catch (error) {
  //         this.logger.error(
  //           `Error fetching Bitget ${params.type} page ${pageNum}: ${error}`,
  //         );
  //         hasMore = false;
  //       }
  //     }

  //     return { listings, announcements };
  //   }

  async fetchBitgetAnnouncements(params: {
    sectionId?: string;
    businessType?: number;
    type: 'listing' | 'delisting';
  }): Promise<{ listings: any[]; announcements: any[] }> {
    const listings: any[] = [];
    const announcements: any[] = [];
    let pageNum = 1;
    const pageSize = 20;
    let hasMore = true;

    // Get the latest announcement date from the database for Bitget
    const latestAnnouncement = await this.dbService
      .getDb()
      .select({ maxDate: sql<Date>`MAX(announce_date)` })
      .from(announcementsTable)
      .where(eq(announcementsTable.source, 'bitget'));

    const latestDate = latestAnnouncement[0]?.maxDate || new Date(0);
    let shouldContinueFetching = true;

    const token = process.env.SCRAPER_API_KEY;
    while (hasMore && shouldContinueFetching) {
      try {
        const targetUrl = encodeURIComponent(
          'https://www.bitget.com/v1/cms/helpCenter/content/section/helpContentDetail',
        );

        let response;

        try {
          if (params.sectionId) {
            // Help Center API
            const config = {
              method: 'POST',
              url: `https://api.scrape.do/?token=${token}&url=${targetUrl}`,
              headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.bitget.com',
                Referer:
                  'https://www.bitget.com/support/sections/5955813039257',
              },
              data: JSON.stringify({
                pageNum: pageNum,
                pageSize: 20,
                params: {
                  sectionId: '5955813039257',
                  languageId: 0,
                  firstSearchTime: Date.now(),
                },
              }),
            };
            response = await axios(config);
          } else if (params.businessType) {
            // Delistings API
            const targetUrl = encodeURIComponent(
              'https://www.bitget.com/v1/msg/public/station/pageList',
            );
            response = await axios.post(
              `https://api.scrape.do/?token=${token}&url=${targetUrl}`,
              {
                pageSize,
                openUnread: 1,
                businessType: params.businessType,
                isPre: false,
                lastEndId: null,
                languageType: 0,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                  Origin: 'https://www.bitget.com',
                  Referer: 'https://www.bitget.com/',
                  Accept: 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                },
              },
            );
          }

          const items = response?.data?.items || response?.data?.list || [];
          if (items.length === 0) {
            hasMore = false;
            break;
          }

          let newItemsFound = false;

          // Process each announcement
          for (const item of items) {
            const publishTime = item.unifiedDisplayTime || item.createTime;
            const announcementDate = new Date(parseInt(publishTime));

            // Skip if announcement is older than our latest date
            if (announcementDate <= latestDate) {
              shouldContinueFetching = false;
              continue;
            }

            newItemsFound = true;
            const contentId = item.contentId || item.id;
            if (!contentId) continue;

            // Fetch announcement details
            const detailTargetUrl = encodeURIComponent(
              'https://www.bitget.com/v1/cms/helpCenter/content/get/helpContentDetail',
            );

            const detailResponse = await axios.post(
              `https://api.scrape.do/?token=${token}&url=${detailTargetUrl}`,
              {
                contentId,
                languageId: 0,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                  Origin: 'https://www.bitget.com',
                  Referer: 'https://www.bitget.com/support',
                  Accept: 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                },
              },
            );

            const detail = detailResponse.data;
            const title = detail.title || item.title;
            const contentHtml = detail.content || '';

            // Skip irrelevant announcements
            if (
              params.type === 'listing' &&
              !title.toLowerCase().includes('list')
            )
              continue;
            if (
              params.type === 'delisting' &&
              !title.toLowerCase().includes('delist')
            )
              continue;

            // Store announcement with parsed=false initially
            const announcement = {
              title,
              source: 'bitget',
              announceDate: announcementDate,
              content: contentHtml,
              parsed: false, // Default to false, will update if we find tokens
            };
            announcements.push(announcement);

            // Extract trading pairs (improved regex)
            const contentText = cheerio.load(contentHtml).text();
            const pairMatches = contentText.matchAll(/(\w+)\/(\w+)/gi);
            const dateMatches = contentText.matchAll(
              /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\))/gi,
            );

            const pairs = Array.from(pairMatches, (m) => m[0]);
            const dates = Array.from(dateMatches, (m) => m[0]);

            // Extract from title if not found in content
            if (pairs.length === 0) {
              const titlePairs = title.match(/(\w+)\/(\w+)/);
              if (titlePairs) pairs.push(titlePairs[0]);
            }

            // Create listing entries
            let parsedAnyTokens = false;
            for (const pair of pairs) {
              const [token, quoteAsset] = pair.split('/');
              listings.push({
                token,
                tokenName: token, // Fallback to token symbol
                quoteAsset,
                announcementDate: announcementDate.toISOString(),
                [params.type === 'listing' ? 'listingDate' : 'delistingDate']:
                  dates[0] || null,
                source: 'bitget',
                type: params.type,
              });
              parsedAnyTokens = true;
            }

            // Update the parsed status in the announcement object if we found any tokens
            if (parsedAnyTokens && announcements.length > 0) {
              const lastAnnouncement = announcements[announcements.length - 1];
              lastAnnouncement.parsed = true;
            }
          }

          // If no new items were found on this page, stop fetching
          if (!newItemsFound) {
            hasMore = false;
          }

          pageNum++;
        } catch (error) {
          this.logger.error(
            `Error fetching Bitget ${params.type} page ${pageNum}: ${error}`,
          );
          hasMore = false;
        }
      } catch (error) {
        this.logger.error(
          `Error fetching Bitget ${params.type} page ${pageNum}: ${error}`,
        );
      }
    }

    return { listings, announcements };
  }

  async fetchContentDetail(contentId) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
      // Set realistic browser environment
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );
      await page.setViewport({ width: 1366, height: 768 });
      await page.setDefaultNavigationTimeout(60000);

      // First visit to establish cookies
      await page.goto('https://www.bitget.com/support', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Make API request
      const apiResponse = await page.evaluate(async (contentId) => {
        const response = await fetch(
          'https://www.bitget.com/v1/cms/helpCenter/content/get/helpContentDetail',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Origin: 'https://www.bitget.com',
              Referer: 'https://www.bitget.com/support',
            },
            body: JSON.stringify({
              contentId: contentId,
              languageId: 0,
            }),
          },
        );

        const responseText = await response.text();

        // Handle HTML responses (Cloudflare challenge)
        if (responseText.startsWith('<!DOCTYPE html>')) {
          throw new Error('Cloudflare challenge detected');
        }

        return JSON.parse(responseText);
      }, contentId);

      if (!apiResponse.data) {
        throw new Error('Invalid response structure');
      }

      return apiResponse.data;
    } catch (error) {
      console.error(`Failed to fetch content ${contentId}:`, error.message);

      // Automatic retry
      if (
        error.message.includes('Cloudflare') ||
        error.message.includes('timeout')
      ) {
        console.log('Retrying...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return this.fetchContentDetail(contentId);
      }

      throw error;
    } finally {
      await browser.close();
    }
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
    const listings: any[] = [];
    const announcements: any[] = [];
    try {
      // Get the latest announcement date from the database
      const latestAnnouncement = await this.dbService
        .getDb()
        .select({ maxDate: sql<Date>`MAX(announce_date)` })
        .from(announcementsTable)
        .where(eq(announcementsTable.source, 'binance'));

      const latestDate = latestAnnouncement[0]?.maxDate || new Date(0);

      // Define API configurations
      const apiConfigs = [
        {
          catalogId: 48,
          type: 'listing',
          url: (page: number, pageSize: number) =>
            `https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=${page}&pageSize=${pageSize}&catalogId=48`,
          titleFilter: (title: string) =>
            title.toLowerCase().includes('list') &&
            !title.toLowerCase().includes('delist'),
        },
        {
          catalogId: 161,
          type: 'delisting',
          url: (page: number, pageSize: number) =>
            `https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=${page}&pageSize=${pageSize}&catalogId=161`,
          titleFilter: (title: string) =>
            title.toLowerCase().includes('delist'),
        },
      ];

      for (const config of apiConfigs) {
        let page = 1;
        const pageSize = 10;
        let hasMoreItems = true;
        let shouldContinueFetching = true;

        while (hasMoreItems && shouldContinueFetching) {
          this.logger.log(`Scraping Binance ${config.type} page ${page}`);
          const url = config.url(page, pageSize);

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
              `Failed to fetch Binance ${config.type} page ${page}: ${data.message}`,
            );
            break;
          }

          const catalogs = data.data.catalogs || [];

          if (catalogs.length === 0) {
            hasMoreItems = false;
            break;
          }
          const articles = catalogs[0]?.articles;
          if (articles.length === 0) {
            hasMoreItems = false;
            break;
          }

          let newArticlesFound = false;

          for (const article of articles) {
            const { title, code, releaseDate } = article;
            const articleDate = new Date(releaseDate);

            // Skip if article is older than our latest date
            if (articleDate <= latestDate) {
              shouldContinueFetching = false;
              break;
            }

            newArticlesFound = true;

            // Fetch detail content using API
            const detailUrl = `https://www.binance.com/bapi/apex/v1/public/cms/article/detail/query?articleCode=${code}`;
            const detailResponse = await axios.get(detailUrl);
            const body = detailResponse.data.data?.body || '';
            let contentHtml = '';
            let tableData: { headers: string[]; rows: string[][] } | null =
              null;
            let parsedTokens = false; // Flag to track if any tokens were parsed

            if (body) {
              try {
                const bodyData = JSON.parse(body);
                contentHtml = this.convertToHtml(bodyData);
                const $detail = cheerio.load(contentHtml);
                const table = $detail('table');
                if (table.length) {
                  const headers = table
                    .find('th')
                    .map((_, el) => $detail(el).text().trim())
                    .get();
                  const rows: string[][] = [];
                  table.find('tr').each((_, tr) => {
                    const cells = $detail(tr)
                      .find('td')
                      .map((_, td) => $detail(td).text().trim())
                      .get();
                    if (cells.length) rows.push(cells);
                  });
                  tableData = { headers, rows };
                }
              } catch (error) {
                this.logger.error(
                  `Failed to parse body for article ${code}: ${error.message}`,
                );
              }
            }

            // Store announcement first (we'll update parsed status later)
            const announcement = {
              title,
              source: 'binance',
              announceDate: articleDate,
              content: contentHtml,
              parsed: false, // Default to false, will update if we find tokens
            };
            announcements.push(announcement);

            if (config.type === 'listing') {
              // Parse table for listings
              let tableData: { headers: string[]; rows: string[][] } | null =
                null;
              if (contentHtml) {
                try {
                  const $detail = cheerio.load(contentHtml);
                  const table = $detail('table');
                  if (table.length) {
                    const headers = table
                      .find('th')
                      .map((_, el) => $detail(el).text().trim())
                      .get();
                    const rows: string[][] = [];
                    table.find('tr').each((_, tr) => {
                      const cells = $detail(tr)
                        .find('td')
                        .map((_, td) => $detail(td).text().trim())
                        .get();
                      if (cells.length) rows.push(cells);
                    });
                    tableData = { headers, rows };
                  }
                } catch (error) {
                  this.logger.error(
                    `Failed to parse table for article ${code}: ${error.message}`,
                  );
                }
              }

              if (tableData) {
                let pairs: string[] = [];
                let dates: string[] = [];
                let underlyingAssets: string[] = [];
                let quoteAssets: string[] = [];

                for (const row of tableData.rows) {
                  const key = row[0]?.toLowerCase() || '';
                  const values = row.slice(1);

                  if (
                    key.includes('usdⓢ-m perpetual contract') ||
                    key.includes('spot trading pair')
                  ) {
                    pairs = values.filter((v) => v.match(/^\w+$/i));
                  } else if (key.includes('launch time')) {
                    dates = values.filter((v) => v.match(/\d{4}-\d{2}-\d{2}/));
                  } else if (key.includes('underlying asset')) {
                    underlyingAssets = values.map((v) => v);
                  } else if (key.includes('settlement asset')) {
                    quoteAssets = values;
                  }
                }

                for (let i = 0; i < pairs.length; i++) {
                  const pair = pairs[i];
                  const token = pair;
                  const quoteAsset = quoteAssets[i] || pair.replace(token, '');
                  const date = dates[i] || dates[0] || '';
                  const tokenName = underlyingAssets[i] || token;

                  if (token && quoteAsset) {
                    listings.push({
                      token,
                      tokenName,
                      announcementDate: articleDate.toISOString(),
                      listingDate: date || null,
                      source: 'binance',
                      type: 'listing',
                    });
                    parsedTokens = true;
                  }
                }
              }
            } else if (config.type === 'delisting' && contentHtml) {
              // Parse content for delistings
              const $content = cheerio.load(contentHtml);
              const contentText = $content.text();

              // Extract pairs and dates (e.g., "At 2025-03-28 03:00 (UTC): GALA/BNB, PERP/BTC")
              const pairDateMatches = contentText.matchAll(
                /At\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\)):\s+([^\n]+)/gi,
              );
              for (const match of pairDateMatches) {
                const date = match[1];
                const pairsStr = match[2];
                const pairs = pairsStr
                  .split(',')
                  .map((p) => p.trim().replace(/\s+/g, ''));

                for (const pair of pairs) {
                  if (pair.includes('/')) {
                    const token = pair.split('/')[0];
                    const quoteAsset = pair.split('/')[1];
                    if (token && quoteAsset) {
                      listings.push({
                        token: quoteAsset ? token + quoteAsset : token,
                        tokenName: token,
                        announcementDate: articleDate.toISOString(),
                        delistingDate: date || null,
                        source: 'binance',
                        type: 'delisting',
                      });
                      parsedTokens = true;
                    }
                  }
                }
              }

              // Extract individual tokens (e.g., "delist BADGER, BAL, BETA on 2025-04-16")
              const tokenDateMatches = contentText.matchAll(
                /delist\s+([^.]+?)\s+on\s+(\d{4}-\d{2}-\d{2})(?:\s+\d{2}:\d{2}\s+\(UTC\))?/gi,
              );
              for (const match of tokenDateMatches) {
                const tokensStr = match[1];
                const date = match[2];
                const tokens = tokensStr.split(',').map((t) => t.trim());

                for (const token of tokens) {
                  if (token) {
                    listings.push({
                      token,
                      tokenName: token,
                      announcementDate: articleDate.toISOString(),
                      delistingDate: date || null,
                      source: 'binance',
                      type: 'delisting',
                    });
                    parsedTokens = true;
                  }
                }
              }
            }

            // Update the parsed status in the announcement object
            if (announcements.length > 0) {
              const lastAnnouncement = announcements[announcements.length - 1];
              lastAnnouncement.parsed = parsedTokens;
            }
          }

          // If no new articles were found on this page, stop fetching
          if (!newArticlesFound) {
            hasMoreItems = false;
          }

          await this.sleep(60000);
          page++;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to scrape Binance: ${error.message}`);
    }
    return { listings, announcements };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  convertToHtml(bodyData: any): string {
    const parseNode = (node: any): string => {
      if (node.node === 'text') {
        return node.text || '';
      } else if (node.node === 'element') {
        const tag = node.tag || 'span';
        const attrs = node.attr || {};
        const children = node.child || [];

        // Handle attributes
        let attrStr = '';
        for (const [key, value] of Object.entries(attrs)) {
          if (key === 'style' && Array.isArray(value)) {
            // Join style array into a proper style string
            attrStr += ` style="${value.join('')}"`;
          } else if (typeof value === 'string') {
            attrStr += ` ${key}="${value}"`;
          } else if (Array.isArray(value)) {
            // Handle other array attributes (like rel)
            attrStr += ` ${key}="${value.join(' ')}"`;
          }
        }

        const content = children.map(parseNode).join('');
        return `<${tag}${attrStr}>${content}</${tag}>`;
      }
      return '';
    };

    // Handle root node with children
    if (bodyData.node === 'root' && bodyData.child) {
      return bodyData.child.map(parseNode).join('');
    }

    return parseNode(bodyData);
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
          // Update existing record
          const currentRecord = existing[0];

          // Prepare update data
          const updateData: any = {
            tokenName: item.tokenName,
            updatedAt: new Date(),
          };

          // Handle listing announcement date (merge with existing)
          if (item.type === 'listing') {
            updateData.listingAnnouncementDate = {
              ...(currentRecord.listingAnnouncementDate || {}),
              [item.source]: item.announcementDate,
            };
            updateData.listingDate = {
              ...(currentRecord.listingDate || {}),
              [item.source]: item.listingDate,
            };
          }

          // Handle delisting announcement date (merge with existing)
          if (item.type === 'delisting') {
            updateData.delistingAnnouncementDate = {
              ...(currentRecord.delistingAnnouncementDate || {}),
              [item.source]: item.announcementDate,
            };
            updateData.delistingDate = {
              ...(currentRecord.delistingDate || {}),
              [item.source]: item.delistingDate,
            };
          }

          await this.dbService
            .getDb()
            .update(listingsTable)
            .set(updateData)
            .where(eq(listingsTable.token, item.token));
        } else {
          // Insert new record
          const insertData: any = {
            token: item.token,
            tokenName: item.tokenName,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Initialize all fields with empty objects
          insertData.listingAnnouncementDate = {};
          insertData.listingDate = {};
          insertData.delistingAnnouncementDate = {};
          insertData.delistingDate = {};

          // Set the appropriate fields based on type
          if (item.type === 'listing') {
            insertData.listingAnnouncementDate[item.source] =
              item.announcementDate;
            insertData.listingDate[item.source] = item.listingDate;
          } else if (item.type === 'delisting') {
            insertData.delistingAnnouncementDate[item.source] =
              item.announcementDate;
            insertData.delistingDate[item.source] = item.delistingDate;
          }

          await this.dbService.getDb().insert(listingsTable).values(insertData);
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
