import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DbService } from 'src/db/db.service';
import * as cheerio from 'cheerio';
import { announcementsTable, listingsTable } from 'src/db/schema';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
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
        _pageNumber: 1,
      });
      listings.push(...listingData.listings);
      announcements.push(...listingData.announcements);

      // 2. Fetch Delistings
      const delistingData = await this.fetchBitgetAnnouncements({
        businessType: 70, // Delistings
        type: 'delisting',
        _pageNumber: 1,
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
    _pageNumber?: number;
  }): Promise<{ listings: any[]; announcements: any[] }> {
    const listings: any[] = [];
    const announcements: any[] = [];
    let pageNum = params._pageNumber ? params._pageNumber : 1;
    const pageSize = 20;
    let hasMore = true;

    // Get the latest announcement date from DB
    const latestAnnouncement = await this.dbService
      .getDb()
      .select({ maxDate: sql<Date>`MAX(announce_date)` })
      .from(announcementsTable)
      .where(eq(announcementsTable.source, 'bitget'));
    const latestDate = latestAnnouncement[0]?.maxDate || new Date(0);
    let shouldContinueFetching = true;
    // const API_KEYS = [
    //   { key: '09e54bdeeddc4507bc89a9b43dd9814a7c02deea125', weight: 40 },
    //   { key: '629f3fee23274f87a48aadd0e4bb28a08e21f3d0ec9', weight: 40 },
    //   { key: 'fe037744ccb9499ebb3c630a4d5c8d89d18a87a6979', weight: 20 }
    // ];

    // // Pre-calculate cumulative weights
    // const TOTAL_WEIGHT = API_KEYS.reduce((sum, k) => sum + k.weight, 0);
    // const CUMULATIVE_WEIGHTS: number[] = [];
    // API_KEYS.reduce((sum, k) => {
    //   CUMULATIVE_WEIGHTS.push(sum + k.weight);
    //   return sum + k.weight;
    // }, 0);
    // const getRandomKey = () => {
    //   const random = Math.random() * TOTAL_WEIGHT;
    //   for (let i = 0; i < CUMULATIVE_WEIGHTS.length; i++) {
    //     if (random < CUMULATIVE_WEIGHTS[i]) {
    //       return API_KEYS[i].key;
    //     }
    //   }
    //   return API_KEYS[0].key; // fallback
    // }

    const token = process.env.SCRAPER_API_KEY;
    while (hasMore && shouldContinueFetching) {
      try {
        const targetUrl =
          'https://www.bitget.com/v1/cms/helpCenter/content/section/helpContentDetail';
        let response;

        if (params.sectionId) {
          // Help Center API
          response = await axios.post(
            `https://api.scrape.do/?token=${token}&url=${targetUrl}`,
            {
              pageNum,
              pageSize: 20,
              params: {
                sectionId: '5955813039257',
                languageId: 0,
                firstSearchTime: Date.now(),
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Origin: 'https://www.bitget.com',
                Referer:
                  'https://www.bitget.com/support/sections/5955813039257',
              },
            },
          );
        } else if (params.businessType) {
          // Delistings API
          response = await axios.post(
            `https://api.scrape.do/?token=${token}&url=${targetUrl}`,
            {
              pageNum,
              pageSize: 20,
              params: {
                sectionId: '12508313443290',
                languageId: 0,
                firstSearchTime: Date.now(),
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                Origin: 'https://www.bitget.com',
                Referer: 'https://www.bitget.com/',
              },
            },
          );
        }

        const items =
          response?.data?.data?.items || response?.data?.data?.list || [];
        if (items.length === 0) {
          hasMore = false;
          break;
        }

        let newItemsFound = false;

        for (const item of items) {
          const publishTime = item.showTime || item.createTime;
          const announcementDate = new Date(parseInt(publishTime));
          const _latestDate = new Date(latestDate);
          if (announcementDate <= _latestDate) {
            shouldContinueFetching = false;
            this.logger.log('There is no new annoucement at Bitget');
            break;
          }
          newItemsFound = true;
          const contentId = item.contentId || item.id;
          if (!contentId) continue;
          const fetchWithRetry = async (contentId: string) => {
            let retries = 0;
            const maxRetries = 3;
            while (retries < maxRetries) {
              try {
                const detailResponse = await axios.post(
                  `https://api.scrape.do/?token=${token}&url=https://www.bitget.com/v1/cms/helpCenter/content/get/helpContentDetail`,
                  { contentId, languageId: 0 },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                      Origin: 'https://www.bitget.com',
                      Referer: 'https://www.bitget.com/support',
                    },
                  },
                );

                return detailResponse;
              } catch (error) {
                if (
                  error.response?.status !== 502 &&
                  error.response?.status !== 429
                ) {
                  throw error; // Re-throw if it's not a 502 or 429 error
                }

                retries++;
                if (retries >= maxRetries) {
                  throw new Error(
                    `Failed after ${maxRetries} retries: ${error.message}`,
                  );
                }

                // Exponential backoff with jitter
                const delay = Math.min(
                  1000 * 2 ** retries + Math.random() * 500,
                  30000, // Max 30 seconds
                );

                this.logger.warn(
                  `Retry ${retries}/${maxRetries} for content ${contentId}. Waiting ${delay}ms...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          };
          // Fetch announcement details
          const detailResponse = await fetchWithRetry(contentId);
          console.log(contentId);
          const detail = detailResponse?.data?.data;
          const title = detail.title || item.title;
          const contentHtml = detail.content || '';

          // Extract pairs (updated logic)
          const $ = cheerio.load(contentHtml);
          const pairs: string[] = [];

          // 1. Extract from <a href="/spot/SUSHIUSDT"> (even if text is "SUSHI")
          $('a[href*="/spot/"]').each((_, el) => {
            const href = $(el).attr('href');
            const pairFromHref = href?.split('/spot/')[1]; // "SUSHIUSDT"
            if (pairFromHref) pairs.push(pairFromHref); // No "/" added
          });

          // 2. Extract from sentences (delisting only)
          if (params.type === 'delisting') {
            const delistRegex =
              /(delist|suspend|remov(e|al)|halt)\s+([A-Za-z0-9]+)\/?([A-Za-z0-9]+)?/gi;
            const matches = Array.from(contentHtml.matchAll(delistRegex));
            matches.forEach((match: any) => {
              const base = match[3]; // "SUSHI"
              const quote = match[4] || 'USDT'; // Default to USDT if missing
              if (base) pairs.push(`${base}${quote}`); // "SUSHIUSDT"
            });
          }

          // 3. Fallback: Regex for pairs like "SUSHI/USDT" in text
          if (pairs.length === 0) {
            // First remove all HTML tags
            const textWithoutHtml = contentHtml.replace(/<[^>]*>?/gm, '');

            // Then look for trading pair patterns
            const pairMatches = Array.from(
              textWithoutHtml.matchAll(/([A-Za-z0-9]+)\/?([A-Za-z0-9]+)/gi),
            );

            pairMatches.forEach((match: any) => {
              // Only add if both parts exist (avoid partial matches)
              if (match[1] && match[2]) {
                pairs.push(`${match[1]}${match[2]}`); // Remove "/"
              }
            });
          }

          // Extract dates (supports multiple formats)
          const dateRegex = [
            /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}(?:,\s+\d{2}:\d{2})?\s+\(UTC(?:\+8)?\))/gi,
            /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\))/gi,
          ];
          const dates: string[] = [];
          dateRegex.forEach((regex) => {
            const matches = Array.from(contentHtml.matchAll(regex));
            matches.forEach((match: any) => dates.push(match[0]));
          });

          // Store announcement
          const announcement = {
            title,
            source: 'bitget',
            announceDate: announcementDate,
            content: contentHtml,
            parsed: false,
          };
          announcements.push(announcement);
          let hasValidPairs = false;
          // Create listings
          pairs.forEach((_rawPair) => {
            const rawPair =
              _rawPair.split('?').length > 0
                ? _rawPair.split('?')[0]
                : _rawPair;
            // 1. Check if pair is already uppercase (no lowercase letters)
            const isUppercase = rawPair === rawPair.toUpperCase();

            // 2. If not, log a warning and convert to uppercase
            if (isUppercase) {
              // 3. Enforce uppercase and remove "/" if present
              const pair = rawPair.toUpperCase().replace(/\//g, '');
              // 5. Extract token name (e.g., "SUSHI" from "SUSHIUSDT")
              const tokenName = pair.replace(/(USDT|BTC|ETH|USDC|BUSD)$/i, '');
              if (pair && tokenName) {
                hasValidPairs = true;
                listings.push({
                  token: pair, // Guaranteed uppercase, no "/" (e.g., "SUSHIUSDT")
                  tokenName, // Extracted base token (e.g., "SUSHI")
                  announcementDate: announcementDate.toISOString(),
                  [params.type === 'listing' ? 'listingDate' : 'delistingDate']:
                    dates[0] || null,
                  source: 'bitget',
                  type: params.type,
                });
              }
            }
          });
          if (hasValidPairs) {
            announcement.parsed = true;
          }
        }

        if (!newItemsFound) hasMore = false;
        this.logger.log(`Scraping Bitget ${params.type} page ${pageNum}`);
        pageNum++;
      } catch (error) {
        this.logger.error(
          `Error fetching Bitget ${params.type} page ${pageNum}: ${error}`,
        );
        hasMore = false;
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
          const bncUuid = crypto.randomUUID();
          const traceId = crypto.randomUUID();
          const response = await axios.get(url, {
            headers: {
              authority: 'www.binance.com',
              accept: '*/*',
              'accept-language': 'en-US,en;q=0.9',
              'bnc-uuid': bncUuid,
              clienttype: 'web',
              'content-type': 'application/json',
              cookie: `bnc-uuid=${bncUuid}; BNC_FV_KEY=330181b01cc1a06a809fa2b9743895800a8e917e`, // Add other cookies if needed
              'device-info':
                'eyJzY3JlZW5fcmVzb2x1dGlvbiI6IjE5MjAsMTA4MCIsImF2YWlsYWJsZV9zY3JlZW5fcmVzb2x1dGlvbiI6IjE5MjAsMTAzMiIsInN5c3RlbV92ZXJzaW9uIjoiV2luZG93cyAxMCIsImJyYW5kX21vZGVsIjoidW5rbm93biIsInN5c3RlbV9sYW5nIjoiZW4tVVMiLCJ0aW1lem9uZSI6IkdNVC0wNDowMCIsInRpbWV6b25lT2Zmc2V0IjoyNDAsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTM3LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJsaXN0X3BsdWdpbiI6IlBERiBWaWV3ZXIsQ2hyb21lIFBERiBWaWV3ZXIsQ2hyb21pdW0gUERGIFZpZXdlcixNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyLFdlYktpdCBidWlsdC1pbiBQREYiLCJjYW52YXNfY29kZSI6IjA2ZjM3MzkzIiwid2ViZ2xfdmVuZG9yIjoiR29vZ2xlIEluYy4gKE5WSURJQSkiLCJ3ZWJnbF9yZW5kZXJlciI6IkFOR0xFIChOVklESUEsIE5WSURJQSBHZUZvcmNlIEdUWCAxMDUwIFRpICgweDAwMDAxQzgyKSBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKSIsImF1ZGlvIjoiMTI0LjA0MzQ3NTI3NTE2MDc0IiwicGxhdGZvcm0iOiJXaW4zMiIsIndlYl90aW1lem9uZSI6IkFtZXJpY2EvTmV3X1lvcmsiLCJkZXZpY2VfbmFtZSI6IkNocm9tZSBWMTM3LjAuMC4wIChXaW5kb3dzKSIsImZpbmdlcnByaW50IjoiYmJlMjRkYWI0MTE3N2Q1MGMwZjM0OWFmNzVlZTU4NzkiLCJkZXZpY2VfaWQiOiIiLCJyZWxhdGVkX2RldmljZV9pZHMiOiIifQ==',
              'fvideo-id': '330181b01cc1a06a809fa2b9743895800a8e917e',
              'fvideo-token':
                'Z6xvaln79AXWBPcswcIr8Hv8D1GDhPXzokqL+osVc19TdIwSQ6uBXVko1cXURaOCW0lHO5bDsjkDE5EaLCZvjFoSf0uaOzX5JlKonoi4FBPtY5dRdKGcK8ex6IRknn+jA1RomhOjhEJlJm72rLCuK1A1oAlN+tbN7Yuc60lva/hjsuURAhguxzRhoBgTJphUE=0a',
              lang: 'en',
              priority: 'u=1, i',
              referer:
                'https://www.binance.com/en/support/announcement/list/48',
              'sec-ch-ua':
                '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'x-trace-id': traceId,
              'x-ui-request-trace': traceId,
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
            const _latestDate = new Date(latestDate);
            // Skip if article is older than our latest date
            if (articleDate <= _latestDate) {
              shouldContinueFetching = false;
              this.logger.log('There is no new annoucement at Binance');
              break;
            }

            newArticlesFound = true;

            // Fetch detail content using API
            const detailUrl = `https://www.binance.com/bapi/apex/v1/public/cms/article/detail/query?articleCode=${code}`;
            const detailResponse = await axios.get(detailUrl);
            const body =
              detailResponse.data.data?.body || detailResponse.data.body || '';
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
                contentHtml = body
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

            // if (config.type === 'listing') {
            //   // Parse table for listings
            //   let tableData: { headers: string[]; rows: string[][] } | null =
            //     null;
            //   if (contentHtml) {
            //     try {
            //       const $detail = cheerio.load(contentHtml);
            //       const table = $detail('table');
            //       if (table.length) {
            //         const headers = table
            //           .find('th')
            //           .map((_, el) => $detail(el).text().trim())
            //           .get();
            //         const rows: string[][] = [];
            //         table.find('tr').each((_, tr) => {
            //           const cells = $detail(tr)
            //             .find('td')
            //             .map((_, td) => $detail(td).text().trim())
            //             .get();
            //           if (cells.length) rows.push(cells);
            //         });
            //         tableData = { headers, rows };
            //       }
            //     } catch (error) {
            //       this.logger.error(
            //         `Failed to parse table for article ${code}: ${error.message}`,
            //       );
            //     }
            //   }

            //   if (tableData) {
            //     let pairs: string[] = [];
            //     let dates: string[] = [];
            //     let underlyingAssets: string[] = [];
            //     let quoteAssets: string[] = [];

            //     for (const row of tableData.rows) {
            //       const key = row[0]?.toLowerCase() || '';
            //       const values = row.slice(1);

            //       if (
            //         key.includes('usdⓢ-m perpetual contract') ||
            //         key.includes('spot trading pair')
            //       ) {
            //         pairs = values.filter((v) => v.match(/^\w+$/i));
            //       } else if (key.includes('launch time')) {
            //         dates = values.filter((v) => v.match(/\d{4}-\d{2}-\d{2}/));
            //       } else if (key.includes('underlying asset')) {
            //         underlyingAssets = values.map((v) => v);
            //       } else if (key.includes('settlement asset')) {
            //         quoteAssets = values;
            //       }
            //     }

            //     for (let i = 0; i < pairs.length; i++) {
            //       const pair = pairs[i];
            //       const token = pair;
            //       const quoteAsset = quoteAssets[i] || pair.replace(token, '');
            //       const date = dates[i] || dates[0] || '';
            //       const tokenName = underlyingAssets[i] || token;

            //       if (token && quoteAsset) {
            //         listings.push({
            //           token,
            //           tokenName,
            //           announcementDate: articleDate.toISOString(),
            //           listingDate: date || null,
            //           source: 'binance',
            //           type: 'listing',
            //         });
            //         parsedTokens = true;
            //       }
            //     }
            //   }
            // } else if (config.type === 'delisting' && contentHtml) {
            //   // Parse content for delistings
            //   const $content = cheerio.load(contentHtml);
            //   const contentText = $content.text();

            //   // Extract pairs and dates (e.g., "At 2025-03-28 03:00 (UTC): GALA/BNB, PERP/BTC")
            //   const pairDateMatches = contentText.matchAll(
            //     /At\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+\(UTC\)):\s+([^\n]+)/gi,
            //   );
            //   for (const match of pairDateMatches) {
            //     const date = match[1];
            //     const pairsStr = match[2];
            //     const pairs = pairsStr
            //       .split(',')
            //       .map((p) => p.trim().replace(/\s+/g, ''));

            //     for (const pair of pairs) {
            //       if (pair.includes('/')) {
            //         const token = pair.split('/')[0];
            //         const quoteAsset = pair.split('/')[1];
            //         if (token && quoteAsset) {
            //           listings.push({
            //             token: quoteAsset ? token + quoteAsset : token,
            //             tokenName: token,
            //             announcementDate: articleDate.toISOString(),
            //             delistingDate: date || null,
            //             source: 'binance',
            //             type: 'delisting',
            //           });
            //           parsedTokens = true;
            //         }
            //       }
            //     }
            //   }

            //   // Extract individual tokens (e.g., "delist BADGER, BAL, BETA on 2025-04-16")
            //   const tokenDateMatches = contentText.matchAll(
            //     /delist\s+([^.]+?)\s+on\s+(\d{4}-\d{2}-\d{2})(?:\s+\d{2}:\d{2}\s+\(UTC\))?/gi,
            //   );
            //   for (const match of tokenDateMatches) {
            //     const tokensStr = match[1];
            //     const date = match[2];
            //     const tokens = tokensStr.split(',').map((t) => t.trim());

            //     for (const token of tokens) {
            //       if (token) {
            //         listings.push({
            //           token,
            //           tokenName: token,
            //           announcementDate: articleDate.toISOString(),
            //           delistingDate: date || null,
            //           source: 'binance',
            //           type: 'delisting',
            //         });
            //         parsedTokens = true;
            //       }
            //     }
            //   }
            // }

            // Update the parsed status in the announcement object
            if (announcements.length > 0) {
              const lastAnnouncement = announcements[announcements.length - 1];
              lastAnnouncement.parsed = false;
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
      return bodyData;
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

  async parseAnnouncementsFromDB(
    dbService: DbService,
  ): Promise<{ listings: any[]; announcements: any[] }> {
    const listings: any[] = [];
    const announcements: any[] = [];

    try {
      // Fetch all unparsed announcements from Binance
      const dbAnnouncements = await dbService
        .getDb()
        .select()
        .from(announcementsTable)
        .where(
          and(
            eq(announcementsTable.source, 'binance'),
            eq(announcementsTable.parsed, false),
          ),
        )
        .orderBy(desc(announcementsTable.announceDate));

      for (const announcement of dbAnnouncements) {
        const { title, content, announceDate } = announcement;
        const $content = cheerio.load(content);
        const contentText = $content.text();
        let parsedTokens = false;

        // Check if it's a listing announcement
        if (
          title.toLowerCase().includes('list') &&
          !title.toLowerCase().includes('delist')
        ) {
          // Parse table for listings
          const table = $content('table');
          if (table.length) {
            const headers = table
              .find('th')
              .map((_, el) => $content(el).text().trim())
              .get();
            const rows: string[][] = [];
            table.find('tr').each((_, tr) => {
              const cells = $content(tr)
                .find('td')
                .map((_, td) => $content(td).text().trim())
                .get();
              if (cells.length) rows.push(cells);
            });

            // Process table data similar to your API function
            let pairs: string[] = [];
            let dates: string[] = [];
            let underlyingAssets: string[] = [];
            let quoteAssets: string[] = [];

            for (const row of rows) {
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
                  announcementDate: announceDate.toISOString(),
                  listingDate: date || null,
                  source: 'binance',
                  type: 'listing',
                });
                parsedTokens = true;
              }
            }
          }
        }
        // Check if it's a delisting announcement
        else if (title.toLowerCase().includes('delist')) {
          // Parse content for delistings (same as your API function)
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
                    announcementDate: announceDate.toISOString(),
                    delistingDate: date || null,
                    source: 'binance',
                    type: 'delisting',
                  });
                  parsedTokens = true;
                }
              }
            }
          }

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
                  announcementDate: announceDate.toISOString(),
                  delistingDate: date || null,
                  source: 'binance',
                  type: 'delisting',
                });
                parsedTokens = true;
              }
            }
          }
        }

        // Mark announcement as parsed if we found tokens
        if (parsedTokens) {
          await dbService
            .getDb()
            .update(announcementsTable)
            .set({ parsed: true })
            .where(eq(announcementsTable.id, announcement.id));
        }

        announcements.push(announcement);
      }
    } catch (error) {
      console.error(`Failed to parse announcements from DB: ${error.message}`);
    }

    return { listings, announcements };
  }

  async parseBitgetAnnouncementsFromDB(
    dbService: DbService,
    type: 'listing' | 'delisting',
  ): Promise<{ listings: any[]; announcements: any[] }> {
    const listings: any[] = [];
    const announcements: any[] = [];

    try {
      // Fetch all unparsed Bitget announcements of the specified type
      const dbAnnouncements = await dbService
        .getDb()
        .select()
        .from(announcementsTable)
        .where(
          and(
            eq(announcementsTable.source, 'bitget'),
            eq(announcementsTable.parsed, false),
            type === 'listing'
              ? ilike(announcementsTable.title, '%list%')
              : ilike(announcementsTable.title, '%delist%'),
          ),
        )
        .orderBy(desc(announcementsTable.announceDate));

      for (const announcement of dbAnnouncements) {
        const { title, content, announceDate } = announcement;
        const $content = cheerio.load(content);
        const contentText = $content.text();
        let parsedAnyTokens = false;

        // Extract trading pairs
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
        for (const pair of pairs) {
          const [token, quoteAsset] = pair.split('/');
          listings.push({
            token,
            tokenName: token, // Fallback to token symbol
            quoteAsset,
            announcementDate: announceDate.toISOString(),
            [type === 'listing' ? 'listingDate' : 'delistingDate']:
              dates[0] || null,
            source: 'bitget',
            type,
          });
          parsedAnyTokens = true;
        }

        // Update the parsed status in the database if we found any tokens
        if (parsedAnyTokens) {
          await dbService
            .getDb()
            .update(announcementsTable)
            .set({ parsed: true })
            .where(eq(announcementsTable.id, announcement.id));
        }

        announcements.push(announcement);
      }
    } catch (error) {
      console.error(
        `Failed to parse Bitget announcements from DB: ${error.message}`,
      );
    }

    return { listings, announcements };
  }
}
