const host = process.env.HOST ?? '127.0.0.1';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const readyUrl = `http://${host}:${port}/api/task-categories`;
const readyTimeoutMs = 60_000;
const readyRetryMs = 250;

async function waitForApi(): Promise<void> {
  const deadline = Date.now() + readyTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(readyUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // Backend ещё поднимается
    }

    await new Promise((resolve) => setTimeout(resolve, readyRetryMs));
  }

  throw new Error(
    `Backend API недоступен (${readyUrl}). Проверь, что Postgres запущен и backend стартовал`,
  );
}

export async function setup() {
  console.log('\nSetting up backend-e2e...\n');
  await waitForApi();
}

export async function teardown() {
  console.log('\nTearing down backend-e2e...\n');
}
