# Multi-stage production build for the frontend.
# Build context must be the repo ROOT (needs frontend/ + shared/).

FROM node:20-alpine AS build
WORKDIR /repo
# API base is same-origin in production; nginx proxies /api to the backend.
ENV VITE_API_BASE_URL=/api/v1
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
COPY shared/ ./shared/
RUN cd frontend && npm run build

FROM nginx:alpine AS runtime
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
