import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { countryController } from '../controllers/CountryController';

export const apiRouter = Router();

// --- Auth ---
apiRouter.post('/auth/register', (req, res) => authController.register(req, res));
apiRouter.post('/auth/login', (req, res) => authController.login(req, res));

// --- Countries & adoption data ---
apiRouter.get('/countries', (req, res) => countryController.list(req, res));
apiRouter.get('/countries/:iso3', (req, res) => countryController.getByIso(req, res));
apiRouter.get('/countries/:iso3/history', (req, res) => countryController.getHistory(req, res));

// --- Regional aggregations ---
apiRouter.get('/regions', (req, res) => countryController.regions(req, res));
