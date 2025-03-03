# Use an official Node.js runtime as a base image
FROM node:20-alpine

RUN apk add --no-cache curl jq

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the entire application to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 4001

# Install application dependencies
RUN npm install

RUN npm run build

RUN chmod +x fetch_env_from_vault.sh

ARG ENV=dev

ENV ENV=$ENV

CMD ["sh", "-c", "if [ \"$ENV\" = \"prod\" ]; then npm run start:prod; else sh fetch_env_from_vault.sh && npm run start:prod; fi"]