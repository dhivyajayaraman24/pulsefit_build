ARG NODE_VERSION=20
ARG SERVICE_PATH=services/core

FROM node:${NODE_VERSION}-bookworm-slim AS build
ARG SERVICE_PATH
WORKDIR /workspace
COPY ${SERVICE_PATH}/package*.json ./
RUN npm ci
COPY ${SERVICE_PATH}/ ./
RUN npm run build
RUN npm prune --omit=dev

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /workspace/package*.json ./
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
