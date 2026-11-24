# Security baseline (ifx-docs 14.1, step 4): pinned Node 22 base, reproducible
# `npm ci`, multi-stage build without dev dependencies, runs as the non-root `node` user.

# ---- build stage ----
FROM node:22.23.5-alpine3.24 AS build

WORKDIR /usr/src/app

# Install exactly what package-lock.json lists
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the application source code
COPY . .

# Set dev as the default environment
ARG ENV=dev

# Conditionally copy the correct environment file based on ENV
RUN if [ "$ENV" = "dev" ]; then \
    cp .env.development .env.local; \
  else \
    cp .env.production .env.local; \
  fi

# Build, then drop dev dependencies for the runtime image
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

# ---- runtime stage ----
FROM node:22.23.5-alpine3.24

WORKDIR /usr/src/app

COPY --from=build --chown=node:node /usr/src/app ./

# Expose the port your app runs on
EXPOSE 3001

# Non-root: the image's built-in `node` user (uid/gid 1000), numeric so runAsNonRoot can verify it
# WORKDIR creates /usr/src/app as root and COPY --chown only changes the copied files,
# so give the runtime user the directory itself, in case Next.js creates new files
# here at runtime (its cache under .next/ is already owned by node).
RUN chown node:node /usr/src/app
USER 1000:1000

# Start the application (production start command)
CMD ["npm", "run", "start"]
