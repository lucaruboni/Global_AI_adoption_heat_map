import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { AppDataSource } from './data-source';
import { Country } from './entities/Country';
import { CountryStatsSnapshot } from './entities/CountryStatsSnapshot';
import { logger } from '../utils/logger';

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

async function seed(): Promise<void> {
  const aei = loadAeiData();
  const snapshotDate = periodToDate(aei.period);
  logger.info(`Seeding ${aei.countries.length} countries for period ${aei.period}`);

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

    const existing = await snapshotRepo.findOne({
      where: { country: { id: country.id }, snapshotDate },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const snapshot = snapshotRepo.create({
      country,
      snapshotDate,
      usagePct: row.usage_pct,
      usagePerCapitaIndex: row.usage_per_capita_index,
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

  logger.info(`Seed complete: ${inserted} snapshots inserted, ${skipped} skipped (already present)`);
  await AppDataSource.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    logger.error('Seed failed', err);
    process.exit(1);
  });
