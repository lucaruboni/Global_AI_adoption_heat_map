import type {
  CountryWithStats,
  CountryStats,
  HistoryPoint,
  RegionalAggregation,
} from '@shared/index';
import { AppDataSource } from '../database/data-source';
import { Country } from '../database/entities/Country';
import { CountryStatsSnapshot } from '../database/entities/CountryStatsSnapshot';
import { mapCountry, mapStats, toIsoDate } from './mappers';

/** Read model for countries and their AI-adoption snapshots. */
export class CountryService {
  private get countries(): ReturnType<typeof AppDataSource.getRepository<Country>> {
    return AppDataSource.getRepository(Country);
  }

  private get snapshots(): ReturnType<typeof AppDataSource.getRepository<CountryStatsSnapshot>> {
    return AppDataSource.getRepository(CountryStatsSnapshot);
  }

  /** All countries with their most-recent snapshot (drives the globe + list). */
  async getAllWithLatestStats(): Promise<CountryWithStats[]> {
    const countries = await this.countries.find({
      relations: { snapshots: true },
      order: { name: 'ASC' },
    });

    return countries.map((country) => {
      const latest = pickLatest(country.snapshots);
      return {
        ...mapCountry(country),
        stats: latest ? mapStats(latest, country) : null,
      };
    });
  }

  /** A single country with its latest snapshot, or null if unknown. */
  async getByIso(iso3: string): Promise<CountryWithStats | null> {
    const country = await this.countries.findOne({
      where: { iso3: iso3.toUpperCase() },
      relations: { snapshots: true },
    });
    if (!country) return null;

    const latest = pickLatest(country.snapshots);
    return {
      ...mapCountry(country),
      stats: latest ? mapStats(latest, country) : null,
    };
  }

  /** Full time-series of a country's usage, oldest first. */
  async getHistory(iso3: string): Promise<HistoryPoint[]> {
    const country = await this.countries.findOne({
      where: { iso3: iso3.toUpperCase() },
    });
    if (!country) return [];

    const snapshots = await this.snapshots.find({
      where: { country: { id: country.id } },
      order: { snapshotDate: 'ASC' },
    });

    return snapshots.map((s) => ({
      snapshotDate: toIsoDate(s.snapshotDate),
      usagePct: s.usagePct ?? 0,
      usagePerCapitaIndex: s.usagePerCapitaIndex ?? 0,
    }));
  }

  /** Aggregate latest usage by region (computed on the fly). */
  async getRegionalAggregations(): Promise<RegionalAggregation[]> {
    const all = await this.getAllWithLatestStats();
    const byRegion = new Map<string, CountryStats[]>();

    for (const country of all) {
      if (!country.stats) continue;
      const list = byRegion.get(country.region) ?? [];
      list.push(country.stats);
      byRegion.set(country.region, list);
    }

    const aggregations: RegionalAggregation[] = [];
    for (const [region, statsList] of byRegion) {
      const totalUsage = statsList.reduce((sum, s) => sum + s.usagePct, 0);
      const avgPerCapita =
        statsList.reduce((sum, s) => sum + s.usagePerCapitaIndex, 0) / statsList.length;
      aggregations.push({
        region,
        snapshotDate: statsList[0]?.snapshotDate ?? '',
        totalUsagePct: Number(totalUsage.toFixed(4)),
        avgPerCapitaIndex: Number(avgPerCapita.toFixed(4)),
        countryCount: statsList.length,
      });
    }

    return aggregations.sort((a, b) => b.totalUsagePct - a.totalUsagePct);
  }
}

/** Returns the snapshot with the most recent date, or null for an empty list. */
function pickLatest(snapshots: CountryStatsSnapshot[]): CountryStatsSnapshot | null {
  if (snapshots.length === 0) return null;
  return snapshots.reduce((latest, current) =>
    current.snapshotDate > latest.snapshotDate ? current : latest
  );
}

export const countryService = new CountryService();
