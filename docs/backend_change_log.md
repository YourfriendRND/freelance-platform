# Change Log

## Epic 1: Task 2 

Подключение PostgreSQL, конфигурация окружения, migration runner.

### shared-config

- Библиотека `@freelance-platform/shared-config` с валидацией env-переменных для БД (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- `loadDatabaseConfig()` — загрузка и проверка конфига
- `databaseConfig` — `registerAs` для NestJS `ConfigModule`

### DatabaseModule

- Глобальный `DatabaseModule` в `apps/backend/src/database/`
- Абстрактный `DatabaseClient` + реализация `PgDatabaseClient` на `pg` (DIP)
- Конфиг через `ConfigType` и `@Inject(databaseConfig.KEY)`
- Автосоздание БД при старте приложения, если `DB_NAME` не существует

### Миграции

- Migration runner в `apps/backend/src/database/migration-runner/`
- Миграции в `apps/backend/src/migrations/`
- Таблица `schema_migrations` создаётся командой `yarn migrate:init`, не через миграцию
- `yarn migrate` — применение новых миграций; без `init` выбрасывает ошибку
- `yarn migrate:rollback` — откат последней миграции (если задан `down`)
- Проверка `checksum` уже применённых миграций

### Прочее

- `.env.example` в корне репозитория
- Зависимости: `pg`, `@nestjs/config`, `tsx` (dev, для CLI миграций)
