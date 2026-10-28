import { spawnSync } from 'node:child_process';
import { connect as connectSocket } from 'node:net';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: resolve(process.cwd(), '.env') });

const MAINTENANCE_DATABASE = 'postgres';
const PORT_READY_TIMEOUT_MS = 60_000;
const PORT_RETRY_MS = 250;
const PORT_PROBE_MS = 1_000;
const BACKEND_E2E_PROJECT = 'backend-e2e';
const FRONTEND_E2E_PROJECT = 'frontend-e2e';
const DATABASE_COMMANDS = ['migrate:init', 'migrate', 'seed:init', 'seed'] as const;

type DatabaseTarget = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

class EnsureE2eInfra {
  static start(projectName: string | undefined): void {
    new EnsureE2eInfra().run(projectName).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    });
  }

  private async run(projectName: string | undefined): Promise<void> {
    const project = this.resolveProject(projectName);
    const target = this.readTarget();
    const open = await this.isPortOpen(target.host, target.port);

    if (!open) {
      console.log('PostgreSQL не запущен, поднимаю docker-compose.local.yml');
      this.runCommand('docker', [
        'compose',
        '-f',
        'docker-compose.local.yml',
        'up',
        '-d',
        '--wait',
      ]);
      await this.waitForPort(target.host, target.port);
    }

    process.env['E2E_DATABASE'] = '1';
    console.log(`E2E database: ${target.database}`);
    await this.ensureDatabase(target);

    for (const command of DATABASE_COMMANDS) {
      this.runCommand('yarn', [command]);
    }

    const e2eArgs = ['nx', 'e2e', project, '--configuration=e2e'];

    if (project === FRONTEND_E2E_PROJECT) {
      e2eArgs.push('--output-style=stream');
    }

    this.runCommand('yarn', e2eArgs);
  }

  private resolveProject(projectName: string | undefined): string {
    if (projectName === BACKEND_E2E_PROJECT || projectName === FRONTEND_E2E_PROJECT) {
      return projectName;
    }

    throw new Error('Укажи проект backend-e2e или frontend-e2e');
  }

  private readTarget(): DatabaseTarget {
    const host = this.readEnv('DB_HOST');
    const portValue = this.readEnv('DB_PORT');
    const user = this.readEnv('DB_USER');
    const password = this.readEnv('DB_PASSWORD');
    const database = this.readEnv('DB_NAME_E2E');
    const port = Number(portValue);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Некорректный DB_PORT');
    }

    return { host, port, user, password, database };
  }

  private readEnv(name: string): string {
    const value = process.env[name]?.trim() ?? '';

    if (value.length === 0) {
      throw new Error(`Не задана переменная ${name}`);
    }

    return value;
  }

  private isPortOpen(host: string, port: number): Promise<boolean> {
    return new Promise((resolveOpen) => {
      const socket = connectSocket({ host, port });

      const finish = (open: boolean) => {
        socket.removeAllListeners();
        socket.destroy();
        resolveOpen(open);
      };

      socket.setTimeout(PORT_PROBE_MS);
      socket.once('connect', () => finish(true));
      socket.once('timeout', () => finish(false));
      socket.once('error', () => finish(false));
    });
  }

  private async waitForPort(host: string, port: number): Promise<void> {
    const deadline = Date.now() + PORT_READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (await this.isPortOpen(host, port)) {
        return;
      }

      await new Promise((resolveWait) => setTimeout(resolveWait, PORT_RETRY_MS));
    }

    throw new Error(`PostgreSQL недоступен по ${host}:${port}`);
  }

  private async ensureDatabase(target: DatabaseTarget): Promise<void> {
    const client = new Client({
      host: target.host,
      port: target.port,
      user: target.user,
      password: target.password,
      database: MAINTENANCE_DATABASE,
    });

    await client.connect();

    try {
      const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        target.database,
      ]);

      if (rowCount === 0) {
        await client.query(
          `CREATE DATABASE ${this.quoteIdentifier(target.database)} OWNER ${this.quoteIdentifier(
            target.user,
          )} ENCODING 'UTF8'`,
        );
        console.log(`Database "${target.database}" created`);
      }
    } finally {
      await client.end();
    }
  }

  private quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  private runCommand(command: string, args: string[]): void {
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

EnsureE2eInfra.start(process.argv[2]);
