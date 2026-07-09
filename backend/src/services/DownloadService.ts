import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import parquet from '@dsnp/parquetjs';
import { AppDataSource } from '../database/data-source';
import { CountryStatsSnapshot } from '../database/entities/CountryStatsSnapshot';
import { DownloadRequest } from '../database/entities/DownloadRequest';
import { User } from '../database/entities/User';
import { ApiError } from '../utils/ApiError';
import { toIsoDate } from './mappers';
import { emailService } from './EmailService';

export type DownloadFormat = 'csv' | 'json' | 'parquet';

const DAY_MS = 24 * 60 * 60 * 1000;

/** A flat, serialization-ready row of the dataset. */
interface DatasetRow {
  iso3: string;
  country: string;
  region: string;
  snapshot_date: string;
  usage_pct: number | null;
  usage_per_capita_index: number | null;
  use_case_work_pct: number | null;
  use_case_personal_pct: number | null;
  use_case_coursework_pct: number | null;
  collaboration_automation_pct: number | null;
  collaboration_augmentation_pct: number | null;
  ai_autonomy_mean: number | null;
  multitasking_pct: number | null;
  top_topic: string | null;
  top_topic_pct: number | null;
}

const FORMAT_META: Record<DownloadFormat, { ext: string; contentType: string }> = {
  csv: { ext: 'csv', contentType: 'text/csv; charset=utf-8' },
  json: { ext: 'json', contentType: 'application/json; charset=utf-8' },
  parquet: { ext: 'parquet', contentType: 'application/vnd.apache.parquet' },
};

function csvCell(value: string | number | null): string {
  if (value === null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: DatasetRow[]): Buffer {
  const cols = Object.keys(rows[0] ?? EMPTY_ROW) as (keyof DatasetRow)[];
  const header = cols.join(',');
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(','));
  return Buffer.from([header, ...body].join('\n'), 'utf-8');
}

async function toParquet(rows: DatasetRow[]): Promise<Buffer> {
  const schema = new parquet.ParquetSchema({
    iso3: { type: 'UTF8' },
    country: { type: 'UTF8' },
    region: { type: 'UTF8' },
    snapshot_date: { type: 'UTF8' },
    usage_pct: { type: 'DOUBLE', optional: true },
    usage_per_capita_index: { type: 'DOUBLE', optional: true },
    use_case_work_pct: { type: 'DOUBLE', optional: true },
    use_case_personal_pct: { type: 'DOUBLE', optional: true },
    use_case_coursework_pct: { type: 'DOUBLE', optional: true },
    collaboration_automation_pct: { type: 'DOUBLE', optional: true },
    collaboration_augmentation_pct: { type: 'DOUBLE', optional: true },
    ai_autonomy_mean: { type: 'DOUBLE', optional: true },
    multitasking_pct: { type: 'DOUBLE', optional: true },
    top_topic: { type: 'UTF8', optional: true },
    top_topic_pct: { type: 'DOUBLE', optional: true },
  });

  // Write to a temp file then read it back — the streaming interface needs a
  // real Writable with backpressure, which a plain object cannot satisfy.
  const path = join(tmpdir(), `aidl-${randomUUID()}.parquet`);
  const writer = await parquet.ParquetWriter.openFile(schema, path);
  for (const row of rows) {
    await writer.appendRow(row as unknown as Record<string, unknown>);
  }
  await writer.close();
  const buffer = await readFile(path);
  await unlink(path).catch(() => undefined);
  return buffer;
}

const EMPTY_ROW = {} as DatasetRow;

export interface DownloadMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface DownloadResult {
  filename: string;
  contentType: string;
  body: Buffer;
}

export class DownloadService {
  private get users(): ReturnType<typeof AppDataSource.getRepository<User>> {
    return AppDataSource.getRepository(User);
  }
  private get snapshots(): ReturnType<typeof AppDataSource.getRepository<CountryStatsSnapshot>> {
    return AppDataSource.getRepository(CountryStatsSnapshot);
  }
  private get downloads(): ReturnType<typeof AppDataSource.getRepository<DownloadRequest>> {
    return AppDataSource.getRepository(DownloadRequest);
  }

  /**
   * Builds the full historical dataset in the requested format for an
   * authenticated user, enforcing one download per 24h and recording an audit row.
   */
  async generate(
    userId: number,
    format: DownloadFormat,
    meta: DownloadMeta
  ): Promise<DownloadResult> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new ApiError('User not found', 404, 'USER_NOT_FOUND');

    if (user.lastDownloadAt && Date.now() - new Date(user.lastDownloadAt).getTime() < DAY_MS) {
      throw new ApiError(
        'Download limit reached: one dataset download per 24 hours',
        429,
        'DOWNLOAD_RATE_LIMIT'
      );
    }

    const snapshots = await this.snapshots.find({
      relations: { country: true },
      order: { snapshotDate: 'ASC' },
    });
    const rows: DatasetRow[] = snapshots.map((s) => ({
      iso3: s.country.iso3,
      country: s.country.name,
      region: s.country.region,
      snapshot_date: toIsoDate(s.snapshotDate),
      usage_pct: s.usagePct,
      usage_per_capita_index: s.usagePerCapitaIndex,
      use_case_work_pct: s.useCaseWorkPct,
      use_case_personal_pct: s.useCasePersonalPct,
      use_case_coursework_pct: s.useCaseCourseworkPct,
      collaboration_automation_pct: s.collaborationAutomationPct,
      collaboration_augmentation_pct: s.collaborationAugmentationPct,
      ai_autonomy_mean: s.aiAutonomyMean,
      multitasking_pct: s.multitaskingPct,
      top_topic: s.topTopic,
      top_topic_pct: s.topTopicPct,
    }));

    let body: Buffer;
    if (format === 'json') {
      body = Buffer.from(JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
    } else if (format === 'parquet') {
      body = await toParquet(rows);
    } else {
      body = toCsv(rows);
    }

    await this.recordAudit(user, format, meta);
    void emailService.sendDatasetReady(user.email, format);

    const { ext, contentType } = FORMAT_META[format];
    return { filename: `ai-adoption-dataset.${ext}`, contentType, body };
  }

  private async recordAudit(user: User, format: DownloadFormat, meta: DownloadMeta): Promise<void> {
    await this.downloads.save(
      this.downloads.create({
        user,
        fileFormat: format,
        dataVersion: '2026-05',
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
      })
    );
    user.downloadCount += 1;
    user.lastDownloadAt = new Date();
    await this.users.save(user);
  }
}

export const downloadService = new DownloadService();
