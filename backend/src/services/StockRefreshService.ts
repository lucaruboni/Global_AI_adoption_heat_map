import { AppDataSource } from '../database/data-source';
import { CompanyStock } from '../database/entities/CompanyStock';
import { StockPriceHistory } from '../database/entities/StockPriceHistory';
import { alphaVantageClient } from './AlphaVantageClient';
import { toIsoDate } from './mappers';
import { logger } from '../utils/logger';

export interface RefreshSummary {
  configured: boolean;
  updated: number;
  skipped: number;
}

/**
 * Refreshes company stock prices from the live feed, inserting one price row per
 * company for today. No-op (configured=false) when no Alpha Vantage key is set.
 */
export class StockRefreshService {
  async refreshAll(): Promise<RefreshSummary> {
    if (!alphaVantageClient.isConfigured) {
      logger.info('Stock refresh skipped: no ALPHA_VANTAGE_API_KEY configured');
      return { configured: false, updated: 0, skipped: 0 };
    }

    const companyRepo = AppDataSource.getRepository(CompanyStock);
    const priceRepo = AppDataSource.getRepository(StockPriceHistory);
    const companies = await companyRepo.find();
    const today = new Date();
    const todayIso = toIsoDate(today);

    let updated = 0;
    let skipped = 0;

    for (const company of companies) {
      const price = await alphaVantageClient.getQuote(company.symbol);
      if (price === null) {
        skipped += 1;
        continue;
      }

      const existing = await priceRepo.find({
        where: { company: { id: company.id } },
        select: { dateRecorded: true },
      });
      if (existing.some((r) => toIsoDate(r.dateRecorded) === todayIso)) {
        skipped += 1;
        continue;
      }

      await priceRepo.save(priceRepo.create({ company, price, marketCap: null, dateRecorded: today }));
      updated += 1;
    }

    logger.info(`Stock refresh complete: ${updated} updated, ${skipped} skipped`);
    return { configured: true, updated, skipped };
  }
}

export const stockRefreshService = new StockRefreshService();
