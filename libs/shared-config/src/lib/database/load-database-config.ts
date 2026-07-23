import { validateConfig } from '../common/validate-config';
import { DatabaseConfigSchema } from './database-config.schema';

export type DatabaseConfig = DatabaseConfigSchema;

export function loadDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  return validateConfig(DatabaseConfigSchema, {
    host: env['DB_HOST'],
    port: env['DB_PORT'],
    user: env['DB_USER'],
    password: env['DB_PASSWORD'],
    database: env['DB_NAME'],
  });
}
