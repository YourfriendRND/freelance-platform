# Change Log

## Epic 2 FE-01 - Страница списка задач

Добавлена публичная страница списка задач: карточки, состояния загрузки и ошибок, клиентская пагинация, виджет фильтров и загрузка данных с API.

### Страница и навигация

- Добавлен lazy-маршрут `/tasks`
- Со страниц welcome, входа и регистрации можно перейти к списку задач
- Страница доступна и гостю, и авторизованному пользователю
- Есть состояния: загрузка, пустой список, ошибка и сам список

### Дашборд

- Добавлен общий layout дашборда: колонка с меню слева и основная область справа
- В меню пока один пункт - Задачи

### Карточка задачи

- Карточка показывает название, описание, категорию, статус, бюджет, дату публикации и способ выполнения
- Отклики и просмотры пока всегда 0 - бэкенд эти поля еще не отдает
- Блок автора заложен в карточке, но скрыт, пока API не начнет присылать данные пользователя

### Пагинация и фильтры

- Список режется на страницы на клиенте: по 3 задачи, кнопки Назад / Вперед и номера страниц
- Над списком - поиск, категория, статус, мин/макс бюджет и сортировка
- Блок фильтров оформлен карточкой с тонкой рамкой
- Категории в селекте приходят с сервера, фильтрация и сортировка пока только в UI и к списку не применяются

### API и состояние

- Добавлены клиентские запросы списка задач и списка категорий
- Данные хранятся в TaskStore: задачи, категории, загрузка и ошибка
- Название категории на карточке берется из загруженного справочника; если категории нет - показывается «Без категории»
- Список запрашивается целиком, без серверной пагинации

### Тесты и CI

- Добавлены unit-тесты страницы, карточки, пагинации и store
- В GitHub Actions при сборке `main` теперь прогоняются и frontend-тесты; деплой ждёт и backend, и frontend

## Epic 1: Task 6 Интеграция состояния пользователей

Завершена cookie-сессионная авторизация на frontend: store, me/refresh/logout, 401 => refresh => retry для любых доменных API.

### Shared Types (`libs/shared-types`)

Добавлены типы:

- `MessageResponse` в `lib/common/common-client.type.ts` - общий ответ с `message` (logout и будущие домены)
- `UserRoleLabel` / `USER_ROLE_LABEL` - подписи ролей

### HTTP (`libs/http`)

- Token `AUTH_SESSION_INVALIDATOR` - колбэк очистки клиентской сессии без зависимости
- `authRefreshInterceptor`: на 401 сохраняет исходный запрос, single-flight `POST /auth/refresh` через `HttpBackend`, retry; при провале refresh вызывает invalidator
- Skip refresh для `/auth/login`, `/auth/join`, `/auth/refresh`, `/auth/logout`
- Цепочка в `provideApiHttp`: credentials => authRefresh
- Вынесена утилита `resolveHttpErrorMessage(error, fallback)` - общая разборка Nest-ошибок

### Client API (`libs/client-api`)

Добавлены запросы: 

- `AuthApi.me()` - `GET /auth/me`
- `AuthApi.refresh()` - `POST /auth/refresh`
- `AuthApi.logout()` - `POST /auth/logout`

## Epic 1: Task 5 Подключение и интеграция State менеджера

Каркас client-state на `@ngrx/signals` (SignalStore), без интеграции форм.

### Dependencies

- Добавлен `@ngrx/signals` как основной State-manager. 

### Client State (`libs/client-state`)

- Создана дополнительная Lib `@freelance-platform/client-state` для глобального state. 
- Добавлен шаблон `AuthStore`

## Epic 1: Task 4 Верстка и интеграция страницы авторизации

Layout страниц, Welcome Page, интеграция login с backend.

### Layout

- Fix: Убран sticky у Header/Footer - страница скроллится целиком
- `UiPageWrapper` - общий layout: header / body / footer
- `UiAuthShell` переименован в `UiAuthContainer` - центрирует и ограничивает ширину контента

### Welcome Page

- Добавлен Feature `welcome-page`
- Добавлен Lazy route `/welcome`; `/` => redirect на `/welcome`

### Login API

- Реализован `AuthApi.login()` - `POST /auth/login`
- Клиентский тип `LoginUserRequest` в `shared-types`
- Изменен `LoginFormComponent`, добавлен вызов `login`

## Epic 1: Task 3 Настройка HTTP-layer

HTTP-клиент, proxy и вызов регистрации через API.

### HTTP (`libs/http`)

- `provideApiHttp` - `HttpClient`, base URL `/api`, credentials interceptor
- Подключение в `app.config.ts`

### Client API (`libs/client-api`)

- Домен auth: `AuthApi.join()`
- Клиентские типы в `shared-types`: `auth-client.type.ts`

### Proxy и регистрация

- Proxy `/api` => `localhost:3000` (без CORS на backend)
- `RegisterFormComponent`: вызов `join`, loading/error, в случае успеха редирект на `/login`

## Epic 1: Task 2 Реализация основных модулей и блоков

Общий chrome приложения и страница авторизации. Старт SPA с login.

### UI (`libs/ui`)

- `UiHeader` - Общий Header страниц
- `UiFooter` - Общий Footer страниц

### Страница авторизации

- Feature `apps/frontend/src/app/features/login/`: `login-page`, `login-form`
- Lazy route `/login`; `/` => redirect на `/login`
- Регистрация перенесена на `/register`

### Layout auth-страниц

- Header (guest) + Footer на login и register
- Grid `auto 1fr auto`, sticky header/footer, контент центрируется по высоте в `UiAuthShell`
- Горизонтальные отступы header/footer: 20% ширины экрана (на узких - 10%)

## Epic 1: Task 1 Настройка Angular

Задача: настроить роутинг, окружение, модули.

### Роутинг

- Standalone-приложение: `bootstrapApplication` в `apps/frontend/src/main.ts`
- `app.routes.ts` - корневые маршруты с lazy load feature через `loadChildren`
- `apps/frontend/src/app/features/register/register.routes.ts` - маршруты feature рядом с кодом feature
- Lazy load страницы регистрации через `loadComponent`
- Shell приложения: только `<router-outlet>` в `app.html`

### Core и Shared

- `libs/ui` (`@freelance-platform/ui`) - shared UI: `UiButton`, `UiTextField`, `UiCheckbox`, `UiSelect`, `UiAuthShell`, `UiBrandHeader`, `UiAuthCard`
- Глобальные стили и CSS-переменные в `apps/frontend/src/styles.scss`

### Форма регистрации

- Feature `apps/frontend/src/app/features/register/`: `register-page`, `register-form`
- UI по макету TaskFlow
- Reactive Forms, клиентская валидация, без запросов к API
- Поля: `role` (Заказчик / Исполнитель), `firstName` (обязательное), `lastName` (необязательное), `email`, `password`, `confirmPassword`, `acceptTerms`
- При старте приложения (`/`) открывается страница регистрации

### Прочее

- Удалён Nx boilerplate (`nx-welcome`)
- E2e-тест: проверка отображения страницы регистрации
