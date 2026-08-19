import { waitForPortOpen } from '@nx/node/utils';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export async function setup() {
  console.log('\nSetting up backend-e2e...\n');
  await waitForPortOpen(port, { host });
}

export async function teardown() {
  console.log('\nTearing down backend-e2e...\n');
}
