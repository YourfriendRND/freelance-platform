import { registerAs } from '@nestjs/config';
import { loadAuthConfig } from './load-auth-config';

export const AUTH_CONFIG_KEY = 'auth';

export type { AuthConfig } from './load-auth-config';

export const authConfig = registerAs(AUTH_CONFIG_KEY, () =>
  loadAuthConfig(),
);
