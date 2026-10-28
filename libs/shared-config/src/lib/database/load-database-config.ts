import { validateConfig } from '../common/validate-config';
import { DatabaseConfigSchema } from './database-config.schema';

export type DatabaseConfig = DatabaseConfigSchema;

export function loadDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const useE2eDatabase = env['E2E_DATABASE'] === '1';

  return validateConfig(DatabaseConfigSchema, {
    host: env['DB_HOST'],
    port: env['DB_PORT'],
    user: env['DB_USER'],
    password: env['DB_PASSWORD'],
    database: useE2eDatabase ? env['DB_NAME_E2E'] : env['DB_NAME'],
  });
}
