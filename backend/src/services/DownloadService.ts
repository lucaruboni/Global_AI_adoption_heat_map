import { AppDataSource } from '../database/data-source';
import { CountryStatsSnapshot } from '../database/entities/CountryStatsSnapshot';
import { DownloadRequest } from '../database/entities/DownloadRequest';
import { User } from '../database/entities/User';
import { ApiError } from '../utils/ApiError';
import { toIsoDate } from './mappers';

const CSV_COLUMNS = [
  'iso3',
  'country',
  'region',
  'snapshot_date',
  'usage_pct',
  'usage_per_capita_index',
  'use_case_work_pct',
  'use_case_personal_pct',
  'use_case_coursework_pct',
  'collaboration_automation_pct',
  'collaboration_augmentation_pct',
  'ai_autonomy_mean',
  'multitasking_pct',
  'top_topic',
  'top_topic_pct',
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function csvCell(value: string | number | null): string {
  if (value === null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface DownloadMeta {
  ipAddress?: string;
  userAgent?: string;
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
   * Builds the full historical dataset as CSV for an authenticated user,
   * enforcing one download per 24h and recording an audit row.
   */
  async generateCsv(userId: number, meta: DownloadMeta): Promise<{ filename: string; csv: string }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new ApiError('User not found', 404, 'USER_NOT_FOUND');

    if (user.lastDownloadAt && Date.now() - new Date(user.lastDownloadAt).getTime() < DAY_MS) {
      throw new ApiError(
        'Download limit reached: one dataset download per 24 hours',
        429,
        'DOWNLOAD_RATE_LIMIT'
      );
    }

    const rows = await this.snapshots.find({
      relations: { country: true },
      order: { snapshotDate: 'ASC' },
    });

    const header = CSV_COLUMNS.join(',');
    const body = rows.map((s) =>
      [
        s.country.iso3,
        s.country.name,
        s.country.region,
        toIsoDate(s.snapshotDate),
        s.usagePct,
        s.usagePerCapitaIndex,
        s.useCaseWorkPct,
        s.useCasePersonalPct,
        s.useCaseCourseworkPct,
        s.collaborationAutomationPct,
        s.collaborationAugmentationPct,
        s.aiAutonomyMean,
        s.multitaskingPct,
        s.topTopic,
        s.topTopicPct,
      ]
        .map(csvCell)
        .join(',')
    );
    const csv = [header, ...body].join('\n');

    // Audit + counters
    await this.downloads.save(
      this.downloads.create({
        user,
        fileFormat: 'csv',
        dataVersion: '2026-05',
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
      })
    );
    user.downloadCount += 1;
    user.lastDownloadAt = new Date();
    await this.users.save(user);

    return { filename: 'ai-adoption-dataset.csv', csv };
  }
}

export const downloadService = new DownloadService();
