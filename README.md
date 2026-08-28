# Freelance Platform

Nx monorepo для онлайн-площадки фриланса: поиск исполнителей на разовые задачи.

Стек: NestJS (backend), Angular (frontend), PostgreSQL, TypeScript. Проект развивается поэтапно - от foundation и CRUD к DDD и event-driven архитектуре.

## Стек

- **Monorepo** - Nx 23, Yarn 1.x
- **Backend** - NestJS 11, `pg`
- **Frontend** - Angular 21 (standalone components, SCSS), `@ngrx/signals` (SignalStore)
- **Database** - PostgreSQL
- **Shared libs** - TypeScript-библиотеки с path aliases

## Структура

```
apps/
  backend/
    src/
      modules/          # NestJS-модули
      common/           # hash/verify password, fillRdo
      database/         # DatabaseModule, pg-клиент, migration runner, seed runner
      migrations/       # SQL-миграции
      seeds/            # seed-файлы
  backend-e2e/          # HTTP e2e backend (Vitest + axios)
  frontend/
    src/
      app/
        features/       # feature-first: welcome, login, register, tasks
        app.routes.ts   # lazy load feature-маршрутов
  frontend-e2e/         # e2e frontend (Playwright)
libs/
  ui/                   # общие UI-компоненты (@freelance-platform/ui)
  http/                 # HttpClient, credentials, session refresh (@freelance-platform/http)
  client-api/           # API-клиенты доменов (@freelance-platform/client-api)
  client-state/         # SignalStore доменов (@freelance-platform/client-state)
  shared-config/        # валидация env (@freelance-platform/shared-config)
  shared-types/         # enums, interfaces
  shared-dto/           # request DTOs
  shared-rdo/           # response objects
docs/
  backend_change_log.md
  frontend_change_log.md
.github/workflows/   # CI/CD (GitHub Actions)
```

## Требования

- Node.js 22.16.0 (см. `.nvmrc`)
- Yarn 1.22.x
- PostgreSQL - локально или через Docker (`docker-compose.local.yml`)
- Docker / Docker Compose - для БД в dev и для деплоя

## Настройка

```bash
yarn install
cp .env.example .env   # заполнить значения
```

Переменные окружения хранятся в `.env` в корне репозитория (сейчас используются backend).

Помимо БД (`DB_*`) для auth нужны:

```
SALT_WORD=...
APP_PREFIX=app
SESSION_LIFETIME_SECONDS=1800
REFRESH_AFTER_SECONDS=3600
```


## Запуск

```bash
yarn backend    # API: http://localhost:3000/api
yarn frontend   # SPA: http://localhost:4200 (`/` => Welcome Page)
```

Swagger UI: http://localhost:3000/docs

При пустой странице в dev-режиме (ошибки Vite `Outdated Optimize Dep` / `EPERM` в `.angular/cache`) - остановить сервер, выполнить `yarn nx reset`, удалить `.angular/cache`, запустить `yarn frontend` снова.

## Docker

### Локально (только PostgreSQL)

Приложения на хосте (`yarn`), БД в контейнере. В `.env`: `DB_HOST=localhost` и заполненные `DB_*`.

```bash
docker compose -f docker-compose.local.yml up -d
yarn migrate:init && yarn migrate   # после первого поднятия БД
yarn seed:init && yarn seed
yarn backend
yarn frontend
```

### Production

Сервисы: 
- `pg`, 
- `migrate`, 
- `seed`,
- `backend`
- `frontend` (nginx на порту 80). 

Переменные только из `.env` (без дефолтов в compose). В контейнерах `DB_HOST=pg`.

```bash
docker compose --env-file .env up -d --build
```

- SPA / API / Swagger (через host Nginx в проде): контейнер слушает `127.0.0.1:8080`
- Локально без host Nginx: http://127.0.0.1:8080 / http://127.0.0.1:8080/api / http://127.0.0.1:8080/docs
- `migrate` - one-shot: `migrate:init` + `migrate`
- `seed` - one-shot: `seed:init` + `seed` (после migrate; `seed:init` пропускается, если `schema_seeds` уже есть), затем стартует backend
- Образы: `apps/backend/Dockerfile`, `apps/frontend/Dockerfile`
- В `NODE_ENV=production` session cookie ставится с флагом `Secure`

## CI/CD

При `push` / merge в `main` GitHub Actions (`.github/workflows/ci-cd.yml`):

- Job `unit-test-backend`: `yarn backend:test`
- Job `unit-test-frontend`: `yarn frontend:test`
- Job `deploy`: SSH на production, `git pull origin main`, затем `--force-recreate migrate`, `--force-recreate seed`, сборка `backend` и `frontend`

Деплой стартует только если оба набора unit-тестов прошли.

Нужны repository secrets: `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH`.

## База данных

### Подключение

Backend подключается к PostgreSQL через глобальный `DatabaseModule`. Взаимодействие с БД идёт через абстрактный `DatabaseClient` — реализация `PgDatabaseClient` на `pg`. Конфигурация загружается из env через `shared-config` и `@nestjs/config`.

При старте приложения, если БД из `DB_NAME` не существует, она создаётся автоматически.

### Таблицы

- `users` - пользователи
- `user_sessions` - сессии
- `task_categories` - категории задач (`title` unique, `description`)
- `tasks` - задачи

### Миграции

Миграции запускаются вручную, отдельно от `serve`:

```bash
yarn migrate:init       # создать таблицу schema_migrations (один раз)
yarn migrate            # применить новые миграции
yarn migrate:rollback   # откатить последнюю (если есть down)
```

Порядок для новой БД: запустить backend (создаст БД) => `migrate:init` => `migrate` => `seed:init` => `seed`.

Файлы миграций - в `apps/backend/src/migrations/`. Каждый файл экспортирует объект `migration` с полями `version`, `checksum`, `description`, `up`, `down` (опционально).

### Сиды

Сиды запускаются вручную, отдельно от `serve`. Учёт применённых файлов - таблица `schema_seeds` (создаётся `yarn seed:init`, не через миграцию). Rollback нет: повторный запуск применяет только новые файлы. Уже применённый файл с другим `checksum` даёт ошибку.

```bash
yarn seed:init          # создать таблицу schema_seeds (один раз)
yarn seed               # применить новые сиды
```

Файлы сидов - в `apps/backend/src/seeds/`. Каждый файл экспортирует объект `seed` с полями `name`, `checksum`, `run`.

## Тестирование

- **Unit backend** - Vitest, specs рядом с кодом (`apps/backend/src/**/*.spec.ts`)
- **E2E backend** - отдельное приложение `apps/backend-e2e`, Vitest + axios против живого API (`*.e2e-spec.ts`): auth, tasks
- **Unit frontend** - Vitest через Angular (`yarn frontend:test`)
- **E2E frontend** - Playwright (`apps/frontend-e2e`)

E2E backend поднимает `backend:serve` через Nx; нужен доступный PostgreSQL и применённые миграции.

```bash
yarn backend:test    # unit backend
yarn backend:e2e     # e2e backend
yarn frontend:test   # unit frontend
yarn test            # unit backend + frontend
```

## Скрипты

- `yarn backend` / `yarn frontend` — dev-серверы
- `yarn backend:test` / `yarn frontend:test` / `yarn backend:e2e` — тесты
- `yarn test` - unit backend + frontend
- `yarn build` - сборка всех проектов
- `yarn lint` - линтинг
- `yarn format` - Prettier
- `yarn migrate:init` / `yarn migrate` / `yarn migrate:rollback` - миграции
- `yarn seed:init` / `yarn seed` - сиды

## Shared libraries

```typescript
import { UiButtonComponent } from '@freelance-platform/ui';
import { AuthApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { UserRole } from '@freelance-platform/shared-types';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
import { loadDatabaseConfig } from '@freelance-platform/shared-config';
```

## Nx

```bash
yarn nx graph
yarn nx show project backend
yarn nx show project frontend
```
