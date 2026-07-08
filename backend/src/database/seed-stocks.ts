import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { CompanyStock } from './entities/CompanyStock';
import { StockPriceHistory } from './entities/StockPriceHistory';
import { logger } from '../utils/logger';

/**
 * Seed data for AI / cloud companies. Prices are approximate year-end closes
 * (2023–2025) plus a mid-2026 point, in USD, for illustrative historical trends.
 * Replace with a live feed (e.g. Alpha Vantage) when an API key is configured.
 */
interface SeedCompany {
  symbol: string;
  name: string;
  sector: string;
  prices: { year: number; month: number; price: number; marketCapB: number }[];
}

const COMPANIES: SeedCompany[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    sector: 'AI Hardware',
    prices: [
      { year: 2023, month: 1, price: 49.5, marketCapB: 1220 },
      { year: 2024, month: 1, price: 49.0, marketCapB: 1200 },
      { year: 2025, month: 1, price: 138.0, marketCapB: 3380 },
      { year: 2026, month: 5, price: 172.0, marketCapB: 4200 },
    ],
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft (Azure / OpenAI)',
    sector: 'Cloud & AI',
    prices: [
      { year: 2023, month: 1, price: 239.0, marketCapB: 1780 },
      { year: 2024, month: 1, price: 376.0, marketCapB: 2800 },
      { year: 2025, month: 1, price: 424.0, marketCapB: 3150 },
      { year: 2026, month: 5, price: 470.0, marketCapB: 3500 },
    ],
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet (Google Cloud / DeepMind)',
    sector: 'Cloud & AI',
    prices: [
      { year: 2023, month: 1, price: 89.0, marketCapB: 1150 },
      { year: 2024, month: 1, price: 139.0, marketCapB: 1730 },
      { year: 2025, month: 1, price: 191.0, marketCapB: 2340 },
      { year: 2026, month: 5, price: 210.0, marketCapB: 2560 },
    ],
  },
  {
    symbol: 'AMZN',
    name: 'Amazon (AWS)',
    sector: 'Cloud',
    prices: [
      { year: 2023, month: 1, price: 85.0, marketCapB: 880 },
      { year: 2024, month: 1, price: 151.0, marketCapB: 1560 },
      { year: 2025, month: 1, price: 219.0, marketCapB: 2300 },
      { year: 2026, month: 5, price: 240.0, marketCapB: 2500 },
    ],
  },
  {
    symbol: 'AMD',
    name: 'AMD',
    sector: 'AI Hardware',
    prices: [
      { year: 2023, month: 1, price: 65.0, marketCapB: 105 },
      { year: 2024, month: 1, price: 138.0, marketCapB: 223 },
      { year: 2025, month: 1, price: 120.0, marketCapB: 195 },
      { year: 2026, month: 5, price: 165.0, marketCapB: 267 },
    ],
  },
  {
    symbol: 'META',
    name: 'Meta (Llama / AI infra)',
    sector: 'AI Research',
    prices: [
      { year: 2023, month: 1, price: 124.0, marketCapB: 330 },
      { year: 2024, month: 1, price: 391.0, marketCapB: 1000 },
      { year: 2025, month: 1, price: 610.0, marketCapB: 1550 },
      { year: 2026, month: 5, price: 720.0, marketCapB: 1830 },
    ],
  },
];

async function seedStocks(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Database connected (stocks seed)');

  const companyRepo = AppDataSource.getRepository(CompanyStock);
  const priceRepo = AppDataSource.getRepository(StockPriceHistory);

  let companies = 0;
  let prices = 0;

  for (const c of COMPANIES) {
    let company = await companyRepo.findOne({ where: { symbol: c.symbol } });
    if (!company) {
      company = await companyRepo.save(
        companyRepo.create({ symbol: c.symbol, name: c.name, sector: c.sector })
      );
      companies += 1;
    }

    for (const p of c.prices) {
      const dateRecorded = new Date(Date.UTC(p.year, p.month - 1, 1));
      const existing = await priceRepo.findOne({
        where: { company: { id: company.id }, dateRecorded },
      });
      if (existing) continue;
      await priceRepo.save(
        priceRepo.create({
          company,
          price: p.price,
          marketCap: p.marketCapB * 1_000_000_000,
          dateRecorded,
        })
      );
      prices += 1;
    }
  }

  logger.info(`Stocks seed complete: ${companies} companies, ${prices} price points inserted`);
  await AppDataSource.destroy();
}

seedStocks()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error('Stocks seed failed', err);
    process.exit(1);
  });
