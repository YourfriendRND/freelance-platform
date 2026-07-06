# Change Log

## Epic 1: Task 1 Настройка Angular

Задача: настроить роутинг, окружение, модули.

### Роутинг

- Standalone-приложение: `bootstrapApplication` в `apps/frontend/src/main.ts`
- `app.routes.ts` — корневые маршруты с lazy load feature через `loadChildren`
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
