import type { Country as CountryDTO, CountryStats, PublicUser } from '@shared/index';
import { Country } from '../database/entities/Country';
import { CountryStatsSnapshot } from '../database/entities/CountryStatsSnapshot';
import { User } from '../database/entities/User';

/**
 * Formats a snapshot date as YYYY-MM-DD. The oracledb driver may return DATE
 * columns as either a JS Date or a string, so we normalize both.
 */
export const toIsoDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
};

export const mapCountry = (country: Country): CountryDTO => ({
  iso3: country.iso3,
  name: country.name,
  region: country.region,
  latitude: country.latitude ?? 0,
  longitude: country.longitude ?? 0,
  gdp2024: country.gdp2024,
  workingAgePopulation: country.workingAgePopulation,
});

export const mapStats = (snapshot: CountryStatsSnapshot, country: Country): CountryStats => ({
  iso3: country.iso3,
  name: country.name,
  region: country.region,
  snapshotDate: toIsoDate(snapshot.snapshotDate),
  usagePct: snapshot.usagePct ?? 0,
  usagePerCapitaIndex: snapshot.usagePerCapitaIndex ?? 0,
  useCaseWorkPct: snapshot.useCaseWorkPct ?? 0,
  useCasePersonalPct: snapshot.useCasePersonalPct ?? 0,
  useCaseCourseworkPct: snapshot.useCaseCourseworkPct ?? 0,
  collaborationAutomationPct: snapshot.collaborationAutomationPct ?? 0,
  collaborationAugmentationPct: snapshot.collaborationAugmentationPct ?? 0,
  aiAutonomyMean: snapshot.aiAutonomyMean ?? 0,
  multitaskingPct: snapshot.multitaskingPct ?? 0,
  topTopic: snapshot.topTopic ?? '',
  topTopicPct: snapshot.topTopicPct ?? 0,
});

export const mapPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  githubUsername: user.githubUsername,
  linkedinUrl: user.linkedinUrl,
  optedInNewsletter: user.optedInNewsletter === 1,
  createdAt: user.createdAt.toISOString(),
});
