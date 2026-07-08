import type { StockSeries } from '@shared/index';
import { AppDataSource } from '../database/data-source';
import { CompanyStock } from '../database/entities/CompanyStock';
import { toIsoDate } from './mappers';

/** Read model for AI / cloud company stock valuations over time. */
export class StockService {
  private get companies(): ReturnType<typeof AppDataSource.getRepository<CompanyStock>> {
    return AppDataSource.getRepository(CompanyStock);
  }

  /** All tracked companies with their full price history (oldest first). */
  async getSeries(): Promise<StockSeries[]> {
    const companies = await this.companies.find({
      relations: { prices: true },
      order: { symbol: 'ASC' },
    });

    return companies.map((company) => {
      const prices = [...company.prices].sort((a, b) =>
        toIsoDate(a.dateRecorded).localeCompare(toIsoDate(b.dateRecorded))
      );
      const latest = prices.at(-1) ?? null;
      return {
        symbol: company.symbol,
        name: company.name,
        sector: company.sector,
        prices: prices.map((p) => ({
          dateRecorded: toIsoDate(p.dateRecorded),
          price: p.price,
          marketCap: p.marketCap,
        })),
        latestPrice: latest?.price ?? null,
        latestMarketCap: latest?.marketCap ?? null,
      };
    });
  }
}

export const stockService = new StockService();
