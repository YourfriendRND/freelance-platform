import { waitForPortOpen } from '@nx/node/utils';

const frontendPort = process.env['FRONTEND_PORT']
  ? Number(process.env['FRONTEND_PORT'])
  : 4200;
const backendPort = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
const host = process.env['HOST'] ?? 'localhost';
const frontendUrl = `http://${host}:${frontendPort}`;
const apiMeUrl = `http://${host}:${backendPort}/api/auth/me`;
const httpReadyTimeoutMs = 60_000;
const httpReadyRetryMs = 250;

async function waitForHttpOk(url: string): Promise<void> {
  const deadline = Date.now() + httpReadyTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Сервер ещё поднимается
    }

    await new Promise((resolve) => setTimeout(resolve, httpReadyRetryMs));
  }

  throw new Error(`Не дождался ответа от ${url}`);
}

async function waitForApi(): Promise<void> {
  const deadline = Date.now() + httpReadyTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(apiMeUrl);

      // Без сессии /me отвечает 401 — это значит, что API уже живой
      if (response.status === 401 || response.ok) {
        return;
      }
    } catch {
      // Backend ещё поднимается
    }

    await new Promise((resolve) => setTimeout(resolve, httpReadyRetryMs));
  }

  throw new Error(
    `Backend API недоступен (${apiMeUrl}). Проверь, что Postgres запущен и backend стартовал`,
  );
}

export default async function globalSetup(): Promise<void> {
  await waitForPortOpen(backendPort, { host });
  await waitForPortOpen(frontendPort, { host });
  await waitForHttpOk(frontendUrl);
  await waitForApi();
}
