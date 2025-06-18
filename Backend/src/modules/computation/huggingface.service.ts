import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { announcementsTable, listingsTable } from 'src/db/schema';
import { DbService } from 'src/db/db.service';
import { eq } from 'drizzle-orm';
import { ScraperService } from '../scraper/scraperService';
import { Observable, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { InferenceClient } from '@huggingface/inference';
import { AxiosResponse } from 'axios';
@Injectable()
export class HuggingFaceService {
  private lastRequestTime = 0;
  private requestCount = 0;
  private readonly RATE_LIMIT = 500;
  private lastReset = Date.now();
  private readonly TIME_WINDOW = 3600000; // 1 hour in ms
  'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
  private readonly API_URL =
    'https://api-inference.huggingface.co/pipeline/text-generation';

  private hf: InferenceClient;
  constructor(
    private dbService: DbService,
    private httpService: HttpService,
  ) {
    this.hf = new InferenceClient(process.env.HF_API_TOKEN);
  }

  private async enforceRateLimit() {
    const now = Date.now();

    // Reset counter if time window has passed
    if (now - this.lastRequestTime > this.TIME_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.TIME_WINDOW - (now - this.lastRequestTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    this.requestCount++;
  }

  private async checkRateLimit() {
    const now = Date.now();
    if (now - this.lastReset > 3600000) {
      // 1 hour
      this.requestCount = 0;
      this.lastReset = now;
    }
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = 3600000 - (now - this.lastReset);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastReset = Date.now();
    }
  }

  private cleanJsonResponse(text: string): any {
    try {
      // Remove markdown code blocks if present
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Find first valid JSON object
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}') + 1;
      const jsonStr = cleaned.slice(jsonStart, jsonEnd);

      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to clean/parse JSON:', text);
      return null;
    }
  }

  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ') // Replace tags with space
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim(); // Trim whitespace
  }

  async askLlama3(prompt: string): Promise<any> {
    const cleanContent = this.stripHtmlTags(prompt);
    const _prompt = `Extract the following as JSON array from this crypto announcement:
    {
        token: pair, // Guaranteed uppercase, no "/" (e.g., "SUSHIUSDT")
        tokenName, // Extracted base token (e.g., "SUSHI")
        announcementDate: announcementDate.toISOString(),
        listingDate: listing date || null,
        delistingDate: delisting date || null
        source: 'bitget', (bitget or binance)
        type: 'listing',  (listing or delisting)
    }
    FYI: token must be trading pair like SUSHIUSDT, ETHBTC, etc and some content have multiple pairs so you need to return all pairs with JSON array... But only Listing & Delisting data so dont give me unnecessary data... It means only return valid JSON data for above format..... token should not be json, it's simple trading pair string... above values must exist (so source is one of 'bitget' or 'binance' nad type is one of 'listing' or 'delisting'). Return value must JSON (!!!no need any other desc, only JSON array!).
    from Content: ${cleanContent}
    Respond ONLY with valid JSON.`;
    const apiKey = process.env.Llama3_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const data = {
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: _prompt }],
    };

    try {
        // const response = await this.hf.textGeneration({
        //     model: 'mistralai/Mistral-7B-Instruct-v0.2',
        //     inputs: prompt,
        //     parameters: {
        //       max_new_tokens: 300,
        //       temperature: 0.7
        //     }
        //   });
  
        const response = await this.httpService.post(url, data, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }).toPromise();
  
          const jsonStr = response?.data?.choices[0].message.content;
          console.log(jsonStr)
        return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      } catch (error) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(`Processing failed: ${error.message}`);
      }

  }

  async extractTokenData(content: string): Promise<any> {
    await this.checkRateLimit();
    const cleanContent = this.stripHtmlTags(content);
    const prompt = `Extract the following as JSON array from this crypto announcement:
    {
        token: pair, // Guaranteed uppercase, no "/" (e.g., "SUSHIUSDT")
        tokenName, // Extracted base token (e.g., "SUSHI")
        announcementDate: announcementDate.toISOString(),
        listingDate: listing date || null,
        delistingDate: delisting date || null
        source: 'bitget', (bitget or binance)
        type: 'listing',  (listing or delisting)
    }
    FYI: token must be trading pair like SUSHIUSDT, ETHBTC, etc and some content have multiple pairs so you need to return all pairs with JSON array... But only Listing & Delisting data so dont give me unnecessary data... It means only return valid JSON data for above format..... token should not be json, it's simple trading pair string... above values must exist (so source is one of 'bitget' or 'binance' nad type is one of 'listing' or 'delisting'). Return value must JSON (no need any other desc, only JSON array!).
    from Content: ${cleanContent}
    Respond ONLY with valid JSON.`;

    try {
      // const response = await this.hf.textGeneration({
      //     model: 'mistralai/Mistral-7B-Instruct-v0.2',
      //     inputs: prompt,
      //     parameters: {
      //       max_new_tokens: 300,
      //       temperature: 0.7
      //     }
      //   });

      const response = await this.hf.chatCompletion({
        provider: 'featherless-ai',
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      this.requestCount++;
      const jsonStr = response?.choices[0]?.message?.content;
      console.log(jsonStr)
      return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    } catch (error) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  async processAnnouncements() {
    // Get unparsed announcements
    const announcements = await this.dbService
      .getDb()
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.parsed, false));

    const results: any[] = [];
    let processedCount = 0;

    for (const announcement of announcements) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        // Stop processing if we're approaching rate limit
        if (processedCount >= this.RATE_LIMIT) {
          console.warn(
            `Rate limit reached (${this.RATE_LIMIT} requests/hour). Pausing...`,
          );
          break;
        }

        const tokenData = await this.askLlama3(announcement.content);
        const _type = this.stripHtmlTags(announcement.content).search('bitget') > 0 ? 'bitget' : 'binance'

        if (tokenData) {
          const data = tokenData.map((item) => ({
            ...item,
            announcementDate: announcement.announceDate,
            source: item.source ? item.source : _type
          }));
          await this.saveListingsToDatabase(data);

          // Mark as parsed
          await this.dbService
            .getDb()
            .update(announcementsTable)
            .set({ parsed: true })
            .where(eq(announcementsTable.id, announcement.id));
            processedCount++;
        }
      } catch (error) {
        console.error(
          `Failed to process announcement ${announcement.id}:`,
          error,
        );
      }
    }

    return {
      processed: results,
      remaining: announcements.length - processedCount,
      rateLimit: this.RATE_LIMIT - processedCount,
    };
  }

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
          if (item.type === 'listing' || item.listingDate) {
            updateData.listingAnnouncementDate = {
              ...(currentRecord.listingAnnouncementDate || {}),
              [item.source]: item.announcementDate,
            };
            updateData.listingDate = {
              ...(currentRecord.listingDate || {}),
              [item.source]: item.listingDate ? item.listingDate : item.announcementDate,
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
              [item.source]: item.delistingDate ? item.delistingDate : item.announcementDate,
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
      console.log(`Saved ${data.length} listing records to database`);
    } catch (error) {
      console.error(`Failed to save listings to database: ${error.message}`);
    }
  }
}
