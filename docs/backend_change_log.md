# Change Log

## Epic 1: Task 5 Настройка Docker

Локально - PostgreSQL в Docker, apps на хосте. 
Production - полный стек в Docker Compose с отдельным сервисом миграций.

### Локально (`docker-compose.local.yml`)

- Сервис `pg`
- Порт `${DB_PORT:-5432}:5432`, credentials из `.env` с дефолтами для удобства local
- Frontend/backend в Docker для local **не** поднимаются
- Запуск apps: `yarn backend` / `yarn frontend`, в `.env` - `DB_HOST=localhost`
- Миграции локально по-прежнему: `yarn migrate:init` => `yarn migrate`

### Production (`docker-compose.yml`)

- Сервисы: `pg`, `migrate`, `backend`, `frontend` - без `${VAR:-default}`, только значения из `.env`
- Порядок: `pg` (healthy) => `migrate` => `backend` => `frontend`
- `migrate` и `backend` - один образ `freelance-platform-backend`; у migrate `command: yarn migrate:init && yarn migrate`, `restart: no`
- Backend: `expose: 3000` (на хост не публикуется), frontend: `80:80`
- `POSTGRES_DB=${DB_NAME}` создаёт БД при первом старте volume - migrate не зависит от автосоздания БД в Nest

### Env

- Local: `DB_HOST=localhost`
- Production compose: `DB_HOST` / `DB_PORT` для apps задаются в `environment` сервисов (`pg` / `5432`)
- Смена `DB_USER`/`DB_PASSWORD` после первого `up` не обновляет уже инициализированный volume - нужен `down -v` или ручное создание пользователя


## Epic 1: Task 4 Реализовать модуль авторизации

Регистрация, логин, logout и refresh сессии на backend. Сессии хранятся в БД, аутентификация через cookie.

### Auth API (`POST /api/auth/*`)

- `join` - регистрация пользователя (`CreateUserDto`), ответ `UserRdo` (201), конфликт email - 409
- `login` - проверка email/пароля, создание сессии, установка httpOnly cookie; ответ `UserRdo`
- `logout` - удаление сессии по текущему пользователю, очистка cookie; ответ `CommonRdo`
- `refresh` - ротация сессии (удаление старой + создание новой), перезапись cookie; `@SkipExpiresCheck()` чтобы guard не блокировал по `expiresAt`
- Cookie: имя `{APP_PREFIX}_{sessionId}`, значение = token; `maxAge` берётся из `refreshAfter`

### SessionModule

- Миграция `user_sessions`: `id`, `user_id` (FK - users), `token` (varchar 128), `refresh_after`, `expires_at`, timestamps
- `ISession` / `SessionDbRow` / `SessionEntity` в `shared-types`
- `SessionService`: генерация одноразового token (128 hex-символов), создание сессии с TTL из env (`SESSION_LIFETIME_SECONDS`, `REFRESH_AFTER_SECONDS`)
- `SessionRepository`: create / findByIdAndToken / deleteByIdAndUserId

### AuthGuard и декораторы

- `AuthGuard` - извлекает cookie `{APP_PREFIX}_{sessionId}` + token, загружает сессию и пользователя в request
- По умолчанию отклоняет сессию, если `now >= expiresAt`
- `@SkipExpiresCheck()` - отключает проверку `expiresAt` (используется на refresh)
- `@CurrentUser()` - достаёт `AuthUserPayload` (`user`, `sessionId`, `token`) из request

### Безопасность паролей

- `hashPassword` / `verifyPassword` на `scrypt` + `SALT_WORD` из env
- Формат хранения: `randomSalt:derivedKeyHex`
- `findByEmail` **не** читает `password_hash`
- Отдельный `findAuthCredentialsById` - `UserAuthCredentials` (`id`, `email`, `passwordHash`) только для login

### shared-config

- Валидация конфигов через class-validator schemas + общий `validateConfig`
- `DatabaseConfigSchema`, `AuthConfigSchema` (`SALT_WORD`, `APP_PREFIX`, `SESSION_LIFETIME_SECONDS`, `REFRESH_AFTER_SECONDS`)
- Для `yarn migrate` добавлен `tsconfig.migrate.json` (`experimentalDecorators` + `useDefineForClassFields: false`), иначе tsx ломает decorators class-validator

### Shared libs

- DTO: `LoginUserDto`, Swagger `@ApiProperty` на `CreateUserDto`
- RDO: расширен `UserRdo` (`firstName`, `lastName`), добавлен `CommonRdo`
- Types: `AuthUserPayload`, `SuccessLoginUser`, `CreateUserRecord`, `UserAuthCredentials`, session-типы
- Backend utils: `fillRdo`, `buildSalt`, `hashPassword`, `verifyPassword`
- Зависимость: `cookie-parser` (чтение cookie в Nest)

### Env (`.env.example`)

```
SALT_WORD=...
APP_PREFIX=app
SESSION_LIFETIME_SECONDS=1800
REFRESH_AFTER_SECONDS=3600
```


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
