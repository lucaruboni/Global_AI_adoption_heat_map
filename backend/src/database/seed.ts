import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { AppDataSource } from './data-source';
import { Country } from './entities/Country';
import { CountryStatsSnapshot } from './entities/CountryStatsSnapshot';
import { logger } from '../utils/logger';
import { toIsoDate } from '../services/mappers';

interface AeiCountry {
  iso3: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  usage_pct: number;
  usage_per_capita_index: number;
  use_case_work_pct: number;
  use_case_personal_pct: number;
  use_case_coursework_pct: number;
  collaboration_bucket_automation_pct: number;
  collaboration_bucket_augmentation_pct: number;
  ai_autonomy_mean: number;
  multitasking_pct: number;
  working_age_pop: number;
  gdp_2024: number | null;
  top_topic: string;
  top_topic_pct: number;
}

interface AeiFile {
  period: string;
  source: string;
  countries: AeiCountry[];
}

/** Parses `aei-data.js` (a `window.AEI = {...};` assignment) into JSON. */
function loadAeiData(): AeiFile {
  const here = dirname(fileURLToPath(import.meta.url));
  const dataPath = resolve(here, '../../../aei-data.js');
  const raw = readFileSync(dataPath, 'utf-8').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Could not locate JSON payload in aei-data.js');
  }
  return JSON.parse(raw.slice(start, end + 1)) as AeiFile;
}

/** Converts an AEI period like "2026-05" to the first day of that month. */
function periodToDate(period: string): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Growth curves (2023→2026) used to backcast pre-2026 usage (matches the MVP/frontend). */
const CURVES = {
  early: [0.22, 0.52, 0.8, 1.0],
  mid: [0.1, 0.34, 0.68, 1.0],
  late: [0.04, 0.18, 0.52, 1.0],
} as const;

function curveFor(aui: number): keyof typeof CURVES {
  if (aui >= 2) return 'early';
  if (aui >= 0.7) return 'mid';
  return 'late';
}

/** A snapshot period to generate: a date plus the curve index (0=2023 … 3=2026). */
interface Period {
  date: Date;
  factorIndex: number;
  actual: boolean;
}

async function seed(): Promise<void> {
  const aei = loadAeiData();
  const currentDate = periodToDate(aei.period);

  // Backcast yearly history for 2023-2025, plus the actual current period.
  const periods: Period[] = [
    { date: new Date(Date.UTC(2023, 0, 1)), factorIndex: 0, actual: false },
    { date: new Date(Date.UTC(2024, 0, 1)), factorIndex: 1, actual: false },
    { date: new Date(Date.UTC(2025, 0, 1)), factorIndex: 2, actual: false },
    { date: currentDate, factorIndex: 3, actual: true },
  ];
  logger.info(
    `Seeding ${aei.countries.length} countries × ${periods.length} periods (2023–${aei.period})`
  );

  await AppDataSource.initialize();
  logger.info('Database connected');

  const countryRepo = AppDataSource.getRepository(Country);
  const snapshotRepo = AppDataSource.getRepository(CountryStatsSnapshot);

  let inserted = 0;
  let skipped = 0;

  for (const row of aei.countries) {
    let country = await countryRepo.findOne({ where: { iso3: row.iso3 } });
    if (!country) {
      country = countryRepo.create({
        iso3: row.iso3,
        name: row.name,
        region: row.region,
        latitude: row.lat,
        longitude: row.lng,
        gdp2024: row.gdp_2024,
        workingAgePopulation: row.working_age_pop,
      });
      country = await countryRepo.save(country);
    }

    const factor = CURVES[curveFor(row.usage_per_capita_index)];

    // Robust idempotency: compare by ISO date string, not by Date binding
    // (oracledb DATE round-trips can shift a raw Date comparison).
    const existingRows = await snapshotRepo.find({
      where: { country: { id: country.id } },
      select: { snapshotDate: true },
    });
    const existingDates = new Set(existingRows.map((r) => toIsoDate(r.snapshotDate)));

    for (const period of periods) {
      const periodIso = toIsoDate(period.date);
      if (existingDates.has(periodIso)) {
        skipped += 1;
        continue;
      }

      // Actual period keeps raw values; historical periods scale usage by the curve.
      const scale = period.actual ? 1 : factor[period.factorIndex];
      const snapshot = snapshotRepo.create({
        country,
        snapshotDate: period.date,
        usagePct: Number((row.usage_pct * scale).toFixed(4)),
        usagePerCapitaIndex: Number((row.usage_per_capita_index * scale).toFixed(4)),
        useCaseWorkPct: row.use_case_work_pct,
        useCasePersonalPct: row.use_case_personal_pct,
        useCaseCourseworkPct: row.use_case_coursework_pct,
        collaborationAutomationPct: row.collaboration_bucket_automation_pct,
        collaborationAugmentationPct: row.collaboration_bucket_augmentation_pct,
        aiAutonomyMean: row.ai_autonomy_mean,
        multitaskingPct: row.multitasking_pct,
        topTopic: row.top_topic,
        topTopicPct: row.top_topic_pct,
      });
      await snapshotRepo.save(snapshot);
      inserted += 1;
    }
  }

  logger.info(`Seed complete: ${inserted} snapshots inserted, ${skipped} skipped (already present)`);
  await AppDataSource.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error('Seed failed', err);
    process.exit(1);
  });
