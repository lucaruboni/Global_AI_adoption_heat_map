import type { ApiSuccess, StockSeries } from '@shared/index';
import { apiClient } from './apiClient';

export const stockService = {
  async list(): Promise<StockSeries[]> {
    const { data } = await apiClient.get<ApiSuccess<StockSeries[]>>('/stocks');
    return data.data;
  },
};
