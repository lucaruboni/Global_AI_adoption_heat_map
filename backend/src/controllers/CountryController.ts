import { Request, Response } from 'express';
import { countryService } from '../services/CountryService';
import { ApiError } from '../utils/ApiError';

export class CountryController {
  async list(_req: Request, res: Response): Promise<void> {
    const countries = await countryService.getAllWithLatestStats();
    res.json({
      data: countries,
      meta: { count: countries.length, generatedAt: new Date().toISOString() },
    });
  }

  async getByIso(req: Request, res: Response): Promise<void> {
    const iso3 = req.params.iso3;
    const country = await countryService.getByIso(iso3);
    if (!country) {
      throw new ApiError(`Country not found: ${iso3}`, 404, 'COUNTRY_NOT_FOUND');
    }
    res.json({ data: country });
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const iso3 = req.params.iso3;
    const history = await countryService.getHistory(iso3);
    res.json({ data: history, meta: { count: history.length, generatedAt: new Date().toISOString() } });
  }

  async regions(_req: Request, res: Response): Promise<void> {
    const regions = await countryService.getRegionalAggregations();
    res.json({ data: regions, meta: { count: regions.length } });
  }
}

export const countryController = new CountryController();
