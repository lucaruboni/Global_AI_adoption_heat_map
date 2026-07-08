import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { HardwareSalesIndex } from './entities/HardwareSalesIndex';
import { logger } from '../utils/logger';
import { toIsoDate } from '../services/mappers';

/**
 * Illustrative yearly AI-capable hardware sales (2023-2026): GPU/CPU units and
 * RAM shipped, plus a relative price index. A proxy for local/on-prem AI capacity.
 * Replace with a real vendor/analyst feed when available.
 */
interface HardwareRow {
  year: number;
  gpuUnitsM: number; // millions of AI-capable GPUs
  cpuUnitsM: number; // millions of server/AI CPUs
  ramExabytes: number; // total RAM shipped, in exabytes
  priceIndex: number; // 100 = 2023 baseline
}

const ROWS: HardwareRow[] = [
  { year: 2023, gpuUnitsM: 32, cpuUnitsM: 24, ramExabytes: 3.1, priceIndex: 100 },
  { year: 2024, gpuUnitsM: 58, cpuUnitsM: 29, ramExabytes: 4.4, priceIndex: 128 },
  { year: 2025, gpuUnitsM: 96, cpuUnitsM: 35, ramExabytes: 6.2, priceIndex: 171 },
  { year: 2026, gpuUnitsM: 140, cpuUnitsM: 41, ramExabytes: 8.5, priceIndex: 205 },
];

async function seedHardware(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Database connected (hardware seed)');
  const repo = AppDataSource.getRepository(HardwareSalesIndex);

  const existing = await repo.find({ select: { dateRecorded: true } });
  const seen = new Set(existing.map((r) => toIsoDate(r.dateRecorded)));

  let inserted = 0;
  for (const row of ROWS) {
    const dateRecorded = new Date(Date.UTC(row.year, 0, 1));
    if (seen.has(toIsoDate(dateRecorded))) continue;
    await repo.save(
      repo.create({
        dateRecorded,
        gpuSalesUnits: Math.round(row.gpuUnitsM * 1_000_000),
        cpuSalesUnits: Math.round(row.cpuUnitsM * 1_000_000),
        ramGbSold: row.ramExabytes * 1e9, // exabytes → GB
        priceIndex: row.priceIndex,
        source: 'illustrative-estimate',
      })
    );
    inserted += 1;
  }

  logger.info(`Hardware seed complete: ${inserted} yearly records inserted`);
  await AppDataSource.destroy();
}

seedHardware()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error('Hardware seed failed', err);
    process.exit(1);
  });
