import { Request, Response } from 'express';
import { downloadService } from '../services/DownloadService';
import { ApiError } from '../utils/ApiError';

export class DownloadController {
  async dataset(req: Request, res: Response): Promise<void> {
    if (req.userId == null) {
      throw new ApiError('Authentication required', 401, 'NO_TOKEN');
    }
    const { filename, csv } = await downloadService.generateCsv(req.userId, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}

export const downloadController = new DownloadController();
