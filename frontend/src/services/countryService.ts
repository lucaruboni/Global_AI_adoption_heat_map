import type {
  ApiSuccess,
  CountryWithStats,
  GlobalHistoryPoint,
  HistoryPoint,
  RegionalAggregation,
} from '@shared/index';
import { apiClient } from './apiClient';

export const countryService = {
  async list(): Promise<CountryWithStats[]> {
    const { data } = await apiClient.get<ApiSuccess<CountryWithStats[]>>('/countries');
    return data.data;
  },

  async getByIso(iso3: string): Promise<CountryWithStats> {
    const { data } = await apiClient.get<ApiSuccess<CountryWithStats>>(`/countries/${iso3}`);
    return data.data;
  },

  async getHistory(iso3: string): Promise<HistoryPoint[]> {
    const { data } = await apiClient.get<ApiSuccess<HistoryPoint[]>>(`/countries/${iso3}/history`);
    return data.data;
  },

  async regions(): Promise<RegionalAggregation[]> {
    const { data } = await apiClient.get<ApiSuccess<RegionalAggregation[]>>('/regions');
    return data.data;
  },

  async globalHistory(): Promise<GlobalHistoryPoint[]> {
    const { data } = await apiClient.get<ApiSuccess<GlobalHistoryPoint[]>>('/history/global');
    return data.data;
  },
};
