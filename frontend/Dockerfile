# Use the official lightweight Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Open the desired port
EXPOSE 3001

# Set dev as the default environment
ARG ENV=dev

# Conditionally copy the correct environment file based on ENV
RUN if [ "$ENV" = "dev" ]; then \
    cp .env.development .env.local; \
  else \
    cp .env.production .env.local; \
  fi

# Run the build (always)
RUN npm run build

# Start the application (production start command)
CMD ["npm", "run", "start"]
