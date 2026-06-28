# Freelance Platform

Nx monorepo for a freelance marketplace (PostgreSQL, DDD, Event-Driven Architecture).

## Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Nx 23, Yarn 1.x |
| Backend | NestJS 11 |
| Frontend | Angular 21 |
| Shared | TypeScript libraries with path aliases |

## Structure

```
apps/
  backend/     # NestJS API
  frontend/    # Angular SPA
libs/
  shared-types/  # enums, interfaces (@freelance-platform/shared-types)
  shared-dto/    # request DTOs with class-validator (@freelance-platform/shared-dto)
  shared-rdo/    # response objects (@freelance-platform/shared-rdo)
```

## Requirements

- Node.js 22.16.0 (see `.nvmrc`)
- Yarn 1.22.x

## Setup

```bash
yarn install
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn backend` | Start NestJS API (http://localhost:3000/api) |
| `yarn frontend` | Start Angular dev server (http://localhost:4200) |
| `yarn backend:build` | Build backend |
| `yarn frontend:build` | Build frontend |
| `yarn build` | Build all projects |
| `yarn lint` | Lint all projects |
| `yarn format` | Format with Prettier |

## API docs

After starting the backend, Swagger UI is available at http://localhost:3000/docs

## Shared libraries

Import shared code in any app:

```typescript
import { UserRole } from '@freelance-platform/shared-types';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
```

## Nx

```bash
yarn nx graph          # dependency graph
yarn nx show project backend
```
