import { config } from 'dotenv';
import { resolve } from 'path';
import { MigrationRunner } from './migration.runner';

config({ path: resolve(process.cwd(), '.env') });

const migrationsDir = resolve(__dirname, '../../migrations');

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'up';
  const runner = new MigrationRunner(migrationsDir);

  if (command === 'init') {
    await runner.init();
    return;
  }

  if (command === 'up') {
    await runner.migrate();
    return;
  }

  if (command === 'rollback') {
    await runner.rollback();
    return;
  }

  console.error(`Unknown command: "${command}". Use "init", "up" or "rollback".`);
  process.exit(1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
