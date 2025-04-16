import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoinMarketCapService {
  constructor(private httpService: HttpService) {}

  async getMarketCap(): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
        params: {
          start: 1,
          limit: 250,
          convert: 'USD',
        },
      }),
    );
    return response.data.data;
  }
}