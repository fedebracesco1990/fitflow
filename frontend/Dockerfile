# Production image for the Angular app, served by nginx (used by docker-compose.prod.yml).
# nginx also proxies /api and /socket.io to the backend, so everything shares one origin.

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# set-env.js generates environment.prod.ts; API_URL=/api means "same origin"
ENV NODE_ENV=production API_URL=/api
RUN npm run build

FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/browser/browser /usr/share/nginx/html
EXPOSE 80
