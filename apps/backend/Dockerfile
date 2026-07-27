FROM node:22.16.0-bookworm-slim AS deps

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build

COPY . .
RUN yarn backend:build

FROM node:22.16.0-bookworm-slim AS runner

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=build /app/dist/apps/backend ./dist/apps/backend
COPY --from=build /app/apps/backend ./apps/backend
COPY --from=build /app/libs/shared-config ./libs/shared-config
COPY --from=build /app/libs/shared-types ./libs/shared-types
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json

EXPOSE 3000

CMD ["node", "dist/apps/backend/main.js"]
