/**
 * Shared domain types for Global AI Adoption Heat Map.
 * Imported by both frontend and backend to keep API contracts in sync.
 */

// ============================================================================
// GEOGRAPHY & ADOPTION DATA
// ============================================================================

export type Region =
  | 'North America'
  | 'Latin America'
  | 'Europe'
  | 'Middle East & Africa'
  | 'Asia-Pacific'
  | 'Other';

export interface Country {
  iso3: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  gdp2024: number | null;
  workingAgePopulation: number | null;
}

/** A point-in-time measurement of a country's AI adoption. */
export interface CountryStats {
  iso3: string;
  name: string;
  region: string;
  snapshotDate: string; // ISO date
  usagePct: number;
  usagePerCapitaIndex: number;
  useCaseWorkPct: number;
  useCasePersonalPct: number;
  useCaseCourseworkPct: number;
  collaborationAutomationPct: number;
  collaborationAugmentationPct: number;
  aiAutonomyMean: number;
  multitaskingPct: number;
  topTopic: string;
  topTopicPct: number;
}

/** Country enriched with its latest stats (used by the globe + cards). */
export interface CountryWithStats extends Country {
  stats: CountryStats | null;
}

export interface RegionalAggregation {
  region: string;
  snapshotDate: string;
  totalUsagePct: number;
  avgPerCapitaIndex: number;
  countryCount: number;
}

export interface HistoryPoint {
  snapshotDate: string;
  usagePct: number;
  usagePerCapitaIndex: number;
}

/** Aggregated global usage at a point in time. */
export interface GlobalHistoryPoint {
  snapshotDate: string;
  totalUsagePct: number;
  avgPerCapitaIndex: number;
  countryCount: number;
}

// ============================================================================
// COMPANY STOCKS (AI / cloud valuations)
// ============================================================================

export interface StockPricePoint {
  dateRecorded: string;
  price: number;
  marketCap: number | null;
}

export interface StockSeries {
  symbol: string;
  name: string;
  sector: string | null;
  prices: StockPricePoint[];
  latestPrice: number | null;
  latestMarketCap: number | null;
}

// ============================================================================
// USERS & AUTH
// ============================================================================

export interface PublicUser {
  id: number;
  email: string;
  githubUsername: string | null;
  linkedinUrl: string | null;
  optedInNewsletter: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  githubUsername?: string;
  linkedinUrl?: string;
  optedInNewsletter?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ============================================================================
// API ENVELOPE
// ============================================================================

export interface ApiMeta {
  count?: number;
  page?: number;
  pageSize?: number;
  total?: number;
  generatedAt?: string;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
