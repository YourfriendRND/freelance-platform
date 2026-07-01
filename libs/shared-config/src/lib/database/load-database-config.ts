export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Database configuration validation failed: ${name} is required`);
  }

  return value;
}

function parsePort(value: string | undefined): number {
  const port = Number.parseInt(requireEnv('DB_PORT', value), 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      'Database configuration validation failed: DB_PORT must be an integer between 1 and 65535',
    );
  }

  return port;
}

export function loadDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  return {
    host: requireEnv('DB_HOST', env['DB_HOST']),
    port: parsePort(env['DB_PORT']),
    user: requireEnv('DB_USER', env['DB_USER']),
    password: requireEnv('DB_PASSWORD', env['DB_PASSWORD']),
    database: requireEnv('DB_NAME', env['DB_NAME']),
  };
}
