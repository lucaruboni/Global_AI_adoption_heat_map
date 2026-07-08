import { Request, Response } from 'express';
import { stockService } from '../services/StockService';

export class StockController {
  async list(_req: Request, res: Response): Promise<void> {
    const series = await stockService.getSeries();
    res.json({ data: series, meta: { count: series.length } });
  }
}

export const stockController = new StockController();
