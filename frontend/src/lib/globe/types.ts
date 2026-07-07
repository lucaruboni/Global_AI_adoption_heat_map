import type { CountryWithStats } from '@shared/index';
import type { CurveName } from './themes';

/** The per-country shape the globe engine renders and computes on. */
export interface GlobeCountry {
  idx: number;
  iso3: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  usage: number; // usagePct
  aui: number; // usagePerCapitaIndex
  work: number;
  personal: number;
  coursework: number;
  autom: number;
  augm: number;
  autonomy: number;
  multi: number;
  topic: string;
  topicPct: number;
  curve: CurveName;
}

/** Buckets a country into a growth curve by per-capita index (from MVP). */
function curveFor(aui: number): CurveName {
  if (aui >= 2) return 'early';
  if (aui >= 0.7) return 'mid';
  return 'late';
}

/** Maps API countries (with latest stats) into globe countries, skipping any without stats. */
export function toGlobeCountries(countries: CountryWithStats[]): GlobeCountry[] {
  const result: GlobeCountry[] = [];
  countries.forEach((c) => {
    if (!c.stats) return;
    const s = c.stats;
    result.push({
      idx: result.length,
      iso3: c.iso3,
      name: c.name,
      lat: c.latitude,
      lon: c.longitude,
      region: c.region,
      usage: s.usagePct,
      aui: s.usagePerCapitaIndex,
      work: s.useCaseWorkPct,
      personal: s.useCasePersonalPct,
      coursework: s.useCaseCourseworkPct,
      autom: s.collaborationAutomationPct,
      augm: s.collaborationAugmentationPct,
      autonomy: s.aiAutonomyMean,
      multi: s.multitaskingPct,
      topic: s.topTopic,
      topicPct: s.topTopicPct,
      curve: curveFor(s.usagePerCapitaIndex),
    });
  });
  return result;
}
