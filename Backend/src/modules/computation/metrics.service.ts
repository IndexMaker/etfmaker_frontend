import { Injectable } from '@nestjs/common';
import { EtfPriceService } from './etf-price.service';

@Injectable()
export class MetricsService {
  constructor(private etfPriceService: EtfPriceService) {}

  async computeYTD(indexId: string, chainId: number): Promise<number> {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const currentPrice = await this.etfPriceService.computeLivePrice(indexId, chainId);
    const startPrice = await this.etfPriceService.computeHistoricalPrice(
      indexId,
      Math.floor(yearStart.getTime() / 1000),
    );
    if (startPrice === 0) return 0;
    return ((currentPrice - startPrice) / startPrice) * 100;
  }

  async computeSharpeRatio(indexId: string, chainId: number): Promise<number> {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const timestamps: number[] = [];
    for (
      let d = oneYearAgo;
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      timestamps.push(Math.floor(d.getTime() / 1000));
    }

    const prices = await Promise.all(
      timestamps.map((t) => this.etfPriceService.computeHistoricalPrice(indexId, t)),
    );
    const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const riskFreeRate = 0.02 / 365; // Annual 2% daily
    return (meanReturn - riskFreeRate) / (stdDev || 1);
  }
}