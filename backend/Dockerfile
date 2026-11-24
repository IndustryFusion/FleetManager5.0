# Security baseline (ifx-docs 14.1, step 4): pinned Node 22 base, reproducible
# `npm ci`, multi-stage build without dev dependencies, runs as the non-root `node` user.

# ---- build stage ----
FROM node:22.23.5-alpine3.24 AS build

WORKDIR /app

# Install exactly what package-lock.json lists
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy the entire application and build it
COPY . .
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

RUN chmod +x fetch_env_from_vault.sh

# ---- runtime stage ----
FROM node:22.23.5-alpine3.24

# Install curl, jq (used by fetch_env_from_vault.sh)
RUN apk add --no-cache curl jq

WORKDIR /app

COPY --from=build --chown=node:node /app ./

# Expose the port that the application will run on
EXPOSE 4001

ARG ENV=dev

ENV ENV=$ENV

# Non-root: the image's built-in `node` user (uid/gid 1000), numeric so runAsNonRoot can verify it
# WORKDIR creates /app as root and COPY --chown only changes the copied files,
# so give the runtime user the directory itself: the app creates .env here at
# start-up (fetch_env_from_vault.sh).
RUN chown node:node /app
USER 1000:1000

CMD ["sh", "-c", "if [ \"$ENV\" = \"prod\" ]; then npm run start:prod; else sh fetch_env_from_vault.sh && npm run start:prod; fi"]
