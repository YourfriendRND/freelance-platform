import { registerAs } from '@nestjs/config';
import { loadDatabaseConfig } from './load-database-config';

export const DATABASE_CONFIG_KEY = 'database';

export type { DatabaseConfig } from './load-database-config';

export const databaseConfig = registerAs(DATABASE_CONFIG_KEY, () =>
  loadDatabaseConfig(),
);
