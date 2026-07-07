import type { CountryWithStats } from '@shared/index';

const COLUMNS: { header: string; get: (c: CountryWithStats) => string | number }[] = [
  { header: 'iso3', get: (c) => c.iso3 },
  { header: 'name', get: (c) => c.name },
  { header: 'region', get: (c) => c.region },
  { header: 'latitude', get: (c) => c.latitude },
  { header: 'longitude', get: (c) => c.longitude },
  { header: 'gdp_2024', get: (c) => c.gdp2024 ?? '' },
  { header: 'working_age_population', get: (c) => c.workingAgePopulation ?? '' },
  { header: 'snapshot_date', get: (c) => c.stats?.snapshotDate ?? '' },
  { header: 'usage_pct', get: (c) => c.stats?.usagePct ?? '' },
  { header: 'usage_per_capita_index', get: (c) => c.stats?.usagePerCapitaIndex ?? '' },
  { header: 'use_case_work_pct', get: (c) => c.stats?.useCaseWorkPct ?? '' },
  { header: 'use_case_personal_pct', get: (c) => c.stats?.useCasePersonalPct ?? '' },
  { header: 'use_case_coursework_pct', get: (c) => c.stats?.useCaseCourseworkPct ?? '' },
  { header: 'collaboration_automation_pct', get: (c) => c.stats?.collaborationAutomationPct ?? '' },
  { header: 'collaboration_augmentation_pct', get: (c) => c.stats?.collaborationAugmentationPct ?? '' },
  { header: 'ai_autonomy_mean', get: (c) => c.stats?.aiAutonomyMean ?? '' },
  { header: 'multitasking_pct', get: (c) => c.stats?.multitaskingPct ?? '' },
  { header: 'top_topic', get: (c) => c.stats?.topTopic ?? '' },
  { header: 'top_topic_pct', get: (c) => c.stats?.topTopicPct ?? '' },
];

function escapeCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Builds a CSV string from the country dataset. */
export function countriesToCsv(countries: CountryWithStats[]): string {
  const header = COLUMNS.map((col) => col.header).join(',');
  const rows = countries.map((c) => COLUMNS.map((col) => escapeCell(col.get(c))).join(','));
  return [header, ...rows].join('\n');
}

/** Triggers a browser download of the given text as a file. */
export function downloadTextFile(filename: string, text: string, mime = 'text/csv'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
