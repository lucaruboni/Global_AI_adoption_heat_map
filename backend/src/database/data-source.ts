import { DataSource } from 'typeorm';
import { config } from '../config';
import { Country } from './entities/Country';
import { CountryStatsSnapshot } from './entities/CountryStatsSnapshot';
import { User } from './entities/User';
import { DownloadRequest } from './entities/DownloadRequest';
import { CompanyStock } from './entities/CompanyStock';
import { StockPriceHistory } from './entities/StockPriceHistory';
import { HardwareSalesIndex } from './entities/HardwareSalesIndex';

/**
 * TypeORM data source for Oracle.
 *
 * `synchronize` is enabled only in development so the schema auto-creates from
 * entities. Production must use explicit migrations (never synchronize).
 */
export const AppDataSource = new DataSource({
  type: 'oracle',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  serviceName: config.database.serviceName,
  synchronize: config.isDevelopment,
  logging: config.isDevelopment ? ['error', 'warn'] : ['error'],
  entities: [
    Country,
    CountryStatsSnapshot,
    User,
    DownloadRequest,
    CompanyStock,
    StockPriceHistory,
    HardwareSalesIndex,
  ],
  migrations: ['dist/backend/src/database/migrations/*.js'],
});
