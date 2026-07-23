import { validateConfig } from '../common/validate-config';
import { AuthConfigSchema } from './auth-config.schema';

export type AuthConfig = AuthConfigSchema;

export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  return validateConfig(AuthConfigSchema, {
    saltWord: env['SALT_WORD'],
    appPrefix: env['APP_PREFIX'],
    sessionLifetimeSeconds: env['SESSION_LIFETIME_SECONDS'],
    refreshAfterSeconds: env['REFRESH_AFTER_SECONDS'],
  });
}
