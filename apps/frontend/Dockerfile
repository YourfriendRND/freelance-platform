FROM node:22.16.0-bookworm-slim AS build

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn frontend:build

FROM nginx:1.27-alpine

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
