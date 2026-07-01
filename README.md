# Freelance Platform

Nx monorepo для онлайн-площадки фриланса: поиск исполнителей на разовые задачи.

Стек: NestJS (backend), Angular (frontend), PostgreSQL, TypeScript. Проект развивается поэтапно - от foundation и CRUD к DDD и event-driven архитектуре.

## Стек

- **Monorepo** - Nx 23, Yarn 1.x
- **Backend** - NestJS 11, `pg`
- **Frontend** - Angular 21
- **Database** - PostgreSQL
- **Shared libs** - TypeScript-библиотеки с path aliases

## Структура

```
apps/
  backend/
    src/
      app/              # NestJS-модули, контроллеры
      database/         # DatabaseModule, pg-клиент, migration runner
      migrations/       # SQL-миграции
  frontend/             # Angular SPA
libs/
  shared-config/        # валидация env (@freelance-platform/shared-config)
  shared-types/         # enums, interfaces
  shared-dto/           # request DTOs
  shared-rdo/           # response objects
docs/
  backend_change_log.md         # журнал изменений Backend app
```

## Требования

- Node.js 22.16.0 (см. `.nvmrc`)
- Yarn 1.22.x
- PostgreSQL (локально)

## Настройка

```bash
yarn install
cp .env.example .env   # заполнить значения
```

Переменные окружения хранятся в `.env` в корне репозитория.

## Запуск

```bash
yarn backend    # API: http://localhost:3000/api
yarn frontend   # SPA: http://localhost:4200
```

Swagger UI: http://localhost:3000/docs

## База данных

### Подключение

Backend подключается к PostgreSQL через глобальный `DatabaseModule`. Взаимодействие с БД идёт через абстрактный `DatabaseClient` — реализация `PgDatabaseClient` на `pg`. Конфигурация загружается из env через `shared-config` и `@nestjs/config`.

При старте приложения, если БД из `DB_NAME` не существует, она создаётся автоматически.

### Миграции

Миграции запускаются вручную, отдельно от `serve`:

```bash
yarn migrate:init       # создать таблицу schema_migrations (один раз)
yarn migrate            # применить новые миграции
yarn migrate:rollback   # откатить последнюю (если есть down)
```

Порядок для новой БД: запустить backend (создаст БД) => `migrate:init` => `migrate`.

Файлы миграций - в `apps/backend/src/migrations/`. Каждый файл экспортирует объект `migration` с полями `version`, `checksum`, `description`, `up`, `down` (опционально).

## Скрипты

- `yarn backend` / `yarn frontend` — dev-серверы
- `yarn build` - сборка всех проектов
- `yarn lint` - линтинг
- `yarn format` - Prettier
- `yarn migrate:init` / `yarn migrate` / `yarn migrate:rollback` - миграции

## Shared libraries

```typescript
import { loadDatabaseConfig } from '@freelance-platform/shared-config';
import { UserRole } from '@freelance-platform/shared-types';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
```

## Nx

```bash
yarn nx graph
yarn nx show project backend
```
