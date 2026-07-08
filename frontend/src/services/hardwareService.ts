import type { ApiSuccess, HardwareSalesPoint } from '@shared/index';
import { apiClient } from './apiClient';

export const hardwareService = {
  async list(): Promise<HardwareSalesPoint[]> {
    const { data } = await apiClient.get<ApiSuccess<HardwareSalesPoint[]>>('/hardware');
    return data.data;
  },
};
