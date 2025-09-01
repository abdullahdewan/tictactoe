# frontend build stage
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn build

# backend build stage
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY src ./src
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY tsconfig.json ./
RUN yarn build

ENV PORT=5000
ENV FRONTEND_PATH=/app/frontend/dist

EXPOSE 5000
CMD ["yarn", "start"]