# Base image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy dependency files first to leverage Docker's caching
COPY package*.json ./

# Use `npm ci` to install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Ensure hot-reloading works by exposing necessary ports and mounting volumes
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development

# Default command to start the app in development mode
CMD ["npm", "run", "start:dev"]