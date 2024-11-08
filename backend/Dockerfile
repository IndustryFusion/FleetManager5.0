# Use an official Node.js runtime as a base image
FROM node:20-alpine

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

CMD ["npm", "run", "start:prod"]
