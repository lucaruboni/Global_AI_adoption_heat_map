import { apiClient } from './apiClient';
import { downloadTextFile } from '../lib/csv';

export const downloadService = {
  /**
   * Fetches the gated dataset from the server (auth token added by the interceptor)
   * and triggers a browser download. Requires the user to be authenticated.
   */
  async fetchDataset(): Promise<void> {
    const response = await apiClient.get<Blob>('/downloads/dataset', {
      responseType: 'blob',
    });
    const text = await response.data.text();
    downloadTextFile('ai-adoption-dataset.csv', text);
  },
};
