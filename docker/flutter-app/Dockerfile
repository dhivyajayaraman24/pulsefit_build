ARG FLUTTER_VERSION=3.24.5

FROM ghcr.io/cirruslabs/flutter:${FLUTTER_VERSION} AS build
WORKDIR /workspace
COPY apps/member-mobile/pubspec.* ./
RUN flutter pub get
COPY apps/member-mobile/ ./
RUN flutter build web --release

FROM nginx:1.27-alpine AS runtime
COPY --from=build /workspace/build/web /usr/share/nginx/html
EXPOSE 80
