import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { countryController } from '../controllers/CountryController';
import { stockController } from '../controllers/StockController';
import { downloadController } from '../controllers/DownloadController';
import { authenticate } from '../middleware/authenticate';

export const apiRouter = Router();

// --- Auth ---
apiRouter.post('/auth/register', (req, res) => authController.register(req, res));
apiRouter.post('/auth/login', (req, res) => authController.login(req, res));

// --- Countries & adoption data ---
apiRouter.get('/countries', (req, res) => countryController.list(req, res));
apiRouter.get('/countries/:iso3', (req, res) => countryController.getByIso(req, res));
apiRouter.get('/countries/:iso3/history', (req, res) => countryController.getHistory(req, res));

// --- Aggregations & time-series ---
apiRouter.get('/regions', (req, res) => countryController.regions(req, res));
apiRouter.get('/history/global', (req, res) => countryController.globalHistory(req, res));

// --- Company stocks (AI / cloud valuations) ---
apiRouter.get('/stocks', (req, res) => stockController.list(req, res));

// --- Gated dataset download (auth required, 1/day/user, audited) ---
apiRouter.get('/downloads/dataset', authenticate, (req, res) =>
  downloadController.dataset(req, res)
);
