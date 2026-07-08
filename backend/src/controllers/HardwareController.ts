import { Request, Response } from 'express';
import { hardwareService } from '../services/HardwareService';

export class HardwareController {
  async list(_req: Request, res: Response): Promise<void> {
    const series = await hardwareService.getSeries();
    res.json({ data: series, meta: { count: series.length } });
  }
}

export const hardwareController = new HardwareController();
