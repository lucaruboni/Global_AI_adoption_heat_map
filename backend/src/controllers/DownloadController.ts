import { Request, Response } from 'express';
import { downloadService, type DownloadFormat } from '../services/DownloadService';
import { ApiError } from '../utils/ApiError';

const VALID_FORMATS: DownloadFormat[] = ['csv', 'json', 'parquet'];

export class DownloadController {
  async dataset(req: Request, res: Response): Promise<void> {
    if (req.userId == null) {
      throw new ApiError('Authentication required', 401, 'NO_TOKEN');
    }

    const requested = (req.query.format as string | undefined)?.toLowerCase() ?? 'csv';
    if (!VALID_FORMATS.includes(requested as DownloadFormat)) {
      throw new ApiError(
        `Unsupported format "${requested}". Use one of: ${VALID_FORMATS.join(', ')}`,
        400,
        'INVALID_FORMAT'
      );
    }

    const { filename, contentType, body } = await downloadService.generate(
      req.userId,
      requested as DownloadFormat,
      { ipAddress: req.ip, userAgent: req.get('user-agent') ?? undefined }
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  }
}

export const downloadController = new DownloadController();
