import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { stockRefreshService } from '../services/StockRefreshService';
import { logger } from '../utils/logger';

/**
 * One-off / cron job: refresh stock prices from the live feed.
 * Safe to run without an API key (it becomes a logged no-op).
 */
async function main(): Promise<void> {
  await AppDataSource.initialize();
  const summary = await stockRefreshService.refreshAll();
  if (!summary.configured) {
    logger.info('Set ALPHA_VANTAGE_API_KEY to enable live stock refresh.');
  }
  await AppDataSource.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error('Stock refresh job failed', err);
    process.exit(1);
  });
