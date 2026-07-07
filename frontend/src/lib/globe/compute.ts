import { CURVES } from './themes';
import type { GlobeCountry } from './types';

export function yearFactor(c: GlobeCountry, year: number): number {
  return CURVES[c.curve][year - 2023];
}

export function usageAt(c: GlobeCountry, year: number): number {
  return c.usage * yearFactor(c, year);
}

/** Percentage formatter matching the MVP: adaptive precision by magnitude. */
export function fmtP(x: number): string {
  if (x >= 10) return `${Math.round(x)}%`;
  if (x >= 1) return `${x.toFixed(1)}%`;
  return `${x.toFixed(2)}%`;
}

export interface RankedCountry {
  iso3: string;
  rank: string;
  name: string;
  usersF: string;
  pct: number;
}

export interface BarRow {
  name: string;
  shareF: string;
  pct: number;
}

export interface GlobeViewModel {
  totalF: string;
  workF: string;
  automF: string;
  augmF: string;
  automPct: number;
  countryCount: number;
  top10: RankedCountry[];
  regions: BarRow[];
  useCases: BarRow[];
  topics: BarRow[];
}

/** Computes the full derived view model for a given year (from MVP renderVals). */
export function buildViewModel(countries: GlobeCountry[], year: number): GlobeViewModel {
  const empty: GlobeViewModel = {
    totalF: '…',
    workF: '…',
    automF: '…',
    augmF: '',
    automPct: 50,
    countryCount: 0,
    top10: [],
    regions: [],
    useCases: [],
    topics: [],
  };
  if (!countries.length) return empty;

  const withU = countries.map((c) => ({ c, u: usageAt(c, year) }));
  const total = withU.reduce((s, x) => s + x.u, 0) || 1;
  const wavg = (pick: (c: GlobeCountry) => number): number =>
    withU.reduce((s, x) => s + pick(x.c) * x.u, 0) / total;

  const sorted = withU.slice().sort((a, b) => b.u - a.u);
  const top10u = sorted.slice(0, 10).reduce((s, x) => s + x.u, 0);
  const topUsage = sorted[0]?.u ?? 1;

  const autom = wavg((c) => c.autom);

  const top10: RankedCountry[] = sorted.slice(0, 10).map((x, i) => ({
    iso3: x.c.iso3,
    rank: (i + 1 < 10 ? '0' : '') + String(i + 1),
    name: x.c.name,
    usersF: fmtP(x.u),
    pct: Math.round((x.u / topUsage) * 100),
  }));

  const regMap = new Map<string, number>();
  withU.forEach((x) => regMap.set(x.c.region, (regMap.get(x.c.region) ?? 0) + x.u));
  const regs = [...regMap.entries()].map(([name, u]) => ({ name, u })).sort((a, b) => b.u - a.u);
  const topReg = regs[0]?.u ?? 1;
  const regions: BarRow[] = regs.map((g) => ({
    name: g.name,
    shareF: fmtP((g.u / total) * 100),
    pct: Math.round((g.u / topReg) * 100),
  }));

  const ucs = [
    { name: 'Work', v: wavg((c) => c.work) },
    { name: 'Personal', v: wavg((c) => c.personal) },
    { name: 'Coursework', v: wavg((c) => c.coursework) },
  ];
  const maxUc = Math.max(...ucs.map((u) => u.v)) || 1;
  const useCases: BarRow[] = ucs.map((u) => ({
    name: u.name,
    shareF: `${Math.round(u.v)}%`,
    pct: Math.round((u.v / maxUc) * 100),
  }));

  const topicMap = new Map<string, number>();
  withU.forEach((x) => topicMap.set(x.c.topic, (topicMap.get(x.c.topic) ?? 0) + x.u));
  const tps = [...topicMap.entries()]
    .map(([name, u]) => ({ name, u }))
    .sort((a, b) => b.u - a.u)
    .slice(0, 6);
  const topTopic = tps[0]?.u ?? 1;
  const topics: BarRow[] = tps.map((tp) => ({
    name: tp.name,
    shareF: fmtP((tp.u / total) * 100),
    pct: Math.round((tp.u / topTopic) * 100),
  }));

  return {
    totalF: `${Math.round((top10u / total) * 100)}%`,
    workF: `${Math.round(wavg((c) => c.work))}%`,
    automF: `${Math.round(autom)}%`,
    augmF: `${Math.round(wavg((c) => c.augm))}%`,
    automPct: Math.round(autom),
    countryCount: countries.length,
    top10,
    regions,
    useCases,
    topics,
  };
}
