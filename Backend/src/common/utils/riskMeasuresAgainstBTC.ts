import axios from 'axios';

interface RiskMeasures {
  Alpha: string;
  Beta: string;
  'R²': string;
  'Relative Volatility': string;
  'Sharpe Ratio': string;
  'Standard Deviation': string;
  'Tracking Error': string;
}

/**
 * Helper functions
 */
function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
  const avg = mean(arr);
  return mean(arr.map((x) => Math.pow(x - avg, 2)));
}

function standardDeviation(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

function covariance(a: number[], b: number[]): number {
  const avgA = mean(a);
  const avgB = mean(b);
  return mean(a.map((val, i) => (val - avgA) * (b[i] - avgB)));
}

function correlation(a: number[], b: number[]): number {
  return covariance(a, b) / (standardDeviation(a) * standardDeviation(b));
}

function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const r = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(r);
  }
  return returns;
}

/**
 * Main function
 */
export async function calculateRiskMeasuresAgainstBTC(
  indexReturns: number[],
  startDate: Date,
  endDate: Date,
): Promise<RiskMeasures> {
  const fromTimestamp = Math.floor(startDate.getTime() / 1000);
  const toTimestamp = Math.floor(endDate.getTime() / 1000);
  // Fetch Bitcoin prices from CoinGecko
  const url = `https://pro-api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;

  const res = await axios.get(url, {
    headers: {
      'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
    },
  });

  const btcPricesRaw: [number, number][] = res.data.prices;
  // Get 1 price per day (CoinGecko returns every few hours)
  const btcPricesDaily: number[] = [];
  const seenDays = new Set<string>();

  for (const [timestamp, price] of btcPricesRaw) {
    const date = new Date(timestamp);
    const key = date.toISOString().split('T')[0];
    if (!seenDays.has(key)) {
      btcPricesDaily.push(price);
      seenDays.add(key);
    }
  }

  const btcReturns = calculateReturns(btcPricesDaily);

  // Ensure same length
  const minLength = Math.min(indexReturns.length, btcReturns.length);
  const rP = indexReturns.slice(-minLength);
  const rB = btcReturns.slice(-minLength);

  const beta = covariance(rP, rB) / variance(rB);
  const alpha = mean(rP) - beta * mean(rB); // assume risk-free rate is 0
  const rSquared = Math.pow(correlation(rP, rB), 2);
  const stdDev = standardDeviation(rP);
  const trackingErr = standardDeviation(rP.map((r, i) => r - rB[i]));
  const relativeVolatility = stdDev / standardDeviation(rB);
  const sharpeRatio = mean(rP) / stdDev;

  return {
    Alpha: alpha.toFixed(2),
    Beta: beta.toFixed(2),
    'R²': rSquared.toFixed(2),
    'Relative Volatility': relativeVolatility.toFixed(2),
    'Sharpe Ratio': sharpeRatio.toFixed(2),
    'Standard Deviation': (stdDev * 100).toFixed(2), // convert to %
    'Tracking Error': (trackingErr * 100).toFixed(2),
  };
}
