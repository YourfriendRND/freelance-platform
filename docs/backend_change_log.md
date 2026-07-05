# Change Log

## Epic 1: Task 3

Реализовать модуль и таблицу для хранения пользователей.

### Миграция `users`

- Файл `apps/backend/src/migrations/20260702000001_create_users_table.ts`
- Таблица `users`: `id` (uuid), `email` (unique), `first_name`, `last_name`, `password_hash`, `role`, `bio`, `birthday`, `created_at`, `updated_at`, `deleted_at`
- Поддержка отката через `down` (`DROP TABLE users`)

### shared-types

- `IUser` - интерфейс доменной модели пользователя
- `UserDbRow` - тип строки таблицы `users` (snake_case)
- `UserEntity` - доменная сущность с маппингом `fromDb` / `toDb` / `toObject`
- Базовый абстрактный класс `Entity` в `libs/shared-types/src/lib/abstract/`
- `UserRole` - enum ролей (`client`, `freelancer`)

### shared-rdo

- `UserRdo` - объект ответа API (`id`, `email`, `role`, `createdAt`) с `@ApiProperty` и `@Expose`

### UserModule (backend)

- Модуль в `apps/backend/src/modules/user/`
- `UserRepository` - чтение из БД через `DatabaseClient`, маппинг строки в `UserEntity`
- `UserService` - `findOne(id)`, `NotFoundException` если пользователь не найден
- `UserController` - `GET /api/users/:id` (`ParseUUIDPipe`), Swagger-документация
- `UserModule` подключён в `AppModule`

### Прочее

- Структура backend: NestJS-модули перенесены в `apps/backend/src/modules/`


## Epic 1: Task 2 

Подключение PostgreSQL, конфигурация окружения, migration runner.

### shared-config

- Библиотека `@freelance-platform/shared-config` с валидацией env-переменных для БД (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- `loadDatabaseConfig()` - загрузка и проверка конфига
- `databaseConfig` - `registerAs` для NestJS `ConfigModule`

### DatabaseModule

- Глобальный `DatabaseModule` в `apps/backend/src/database/`
- Абстрактный `DatabaseClient` + реализация `PgDatabaseClient` на `pg` (DIP)
- Конфиг через `ConfigType` и `@Inject(databaseConfig.KEY)`
- Автосоздание БД при старте приложения, если `DB_NAME` не существует

### Миграции

- Migration runner в `apps/backend/src/database/migration-runner/`
- Миграции в `apps/backend/src/migrations/`
- Таблица `schema_migrations` создаётся командой `yarn migrate:init`, не через миграцию
- `yarn migrate` - применение новых миграций; без `init` выбрасывает ошибку
- `yarn migrate:rollback` - откат последней миграции (если задан `down`)
- Проверка `checksum` уже применённых миграций

### Прочее

- `.env.example` в корне репозитория
- Зависимости: `pg`, `@nestjs/config`, `tsx` (dev, для CLI миграций)
