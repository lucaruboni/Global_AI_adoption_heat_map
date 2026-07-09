import { apiClient } from './apiClient';
import { downloadTextFile } from '../lib/csv';

export type DownloadFormat = 'csv' | 'json' | 'parquet';

const FILE_EXT: Record<DownloadFormat, string> = {
  csv: 'csv',
  json: 'json',
  parquet: 'parquet',
};

export const downloadService = {
  /**
   * Fetches the gated dataset from the server (auth token added by the interceptor)
   * in the chosen format and triggers a browser download. Requires authentication.
   */
  async fetchDataset(format: DownloadFormat = 'csv'): Promise<void> {
    const response = await apiClient.get<Blob>('/downloads/dataset', {
      params: { format },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-adoption-dataset.${FILE_EXT[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// Re-export for callers that build CSV client-side (kept for compatibility).
export { downloadTextFile };
