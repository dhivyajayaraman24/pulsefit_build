ARG NODE_VERSION=20
ARG APP_PATH=apps/frontdesk-trainer-pwa

FROM node:${NODE_VERSION}-bookworm-slim AS build
ARG APP_PATH
WORKDIR /workspace
COPY ${APP_PATH}/package*.json ./
RUN npm ci
COPY ${APP_PATH}/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 80
