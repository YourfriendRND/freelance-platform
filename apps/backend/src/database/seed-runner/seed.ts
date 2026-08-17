import { config } from 'dotenv';
import { resolve } from 'path';
import { SeedRunner } from './seed.runner';

config({ path: resolve(process.cwd(), '.env') });

const seedsDir = resolve(__dirname, '../../seeds');

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'up';
  const runner = new SeedRunner(seedsDir);

  if (command === 'init') {
    await runner.init();
    return;
  }

  if (command === 'up') {
    await runner.seed();
    return;
  }

  console.error(`Unknown command: "${command}". Use "init" or "up".`);
  process.exit(1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
