# Production image for the backend API.
# The app runs via tsx (the same runtime used in dev), which avoids the ESM
# extension-resolution pitfalls of running raw tsc output under plain node.
# Build context must be the repo ROOT (needs backend/ + shared/).

FROM node:20-alpine
WORKDIR /repo/backend
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
COPY shared/ /repo/shared/

EXPOSE 3000
CMD ["npm", "run", "start"]
