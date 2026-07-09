import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface GlobalQuoteResponse {
  'Global Quote'?: {
    '05. price'?: string;
  };
}

/**
 * Minimal Alpha Vantage client. Returns null (rather than throwing) whenever no
 * API key is configured or the request fails, so callers degrade gracefully to
 * the seeded dataset.
 */
export class AlphaVantageClient {
  get isConfigured(): boolean {
    return config.alphaVantageApiKey !== null;
  }

  async getQuote(symbol: string): Promise<number | null> {
    if (!config.alphaVantageApiKey) return null;
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: config.alphaVantageApiKey,
        },
        timeout: 8000,
      });
      const data = response.data as GlobalQuoteResponse;
      const raw = data['Global Quote']?.['05. price'];
      const price = raw !== undefined ? Number(raw) : NaN;
      return Number.isFinite(price) ? price : null;
    } catch (err) {
      logger.warn('Alpha Vantage quote failed', { symbol, err: (err as Error).message });
      return null;
    }
  }
}

export const alphaVantageClient = new AlphaVantageClient();
