# Use a lightweight and recent Node.js image
FROM node:18.1.0-alpine3.14 AS base

# Set working directory inside the container
RUN mkdir /app && chown node:node /app
WORKDIR /app

# Copy dependency files first for better caching
USER node
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies as root
RUN npm ci

# Change ownership of the node_modules directory
RUN chown -R node:node /app/node_modules

# Copy application source code
COPY --chown=node:node . .

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
