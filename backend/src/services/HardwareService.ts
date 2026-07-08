import type { HardwareSalesPoint } from '@shared/index';
import { AppDataSource } from '../database/data-source';
import { HardwareSalesIndex } from '../database/entities/HardwareSalesIndex';
import { toIsoDate } from './mappers';

/** Read model for the AI-capable hardware sales index over time. */
export class HardwareService {
  private get repo(): ReturnType<typeof AppDataSource.getRepository<HardwareSalesIndex>> {
    return AppDataSource.getRepository(HardwareSalesIndex);
  }

  async getSeries(): Promise<HardwareSalesPoint[]> {
    const rows = await this.repo.find({ order: { dateRecorded: 'ASC' } });
    return rows.map((r) => ({
      dateRecorded: toIsoDate(r.dateRecorded),
      gpuSalesUnits: r.gpuSalesUnits,
      cpuSalesUnits: r.cpuSalesUnits,
      ramGbSold: r.ramGbSold,
      priceIndex: r.priceIndex,
      source: r.source,
    }));
  }
}

export const hardwareService = new HardwareService();
