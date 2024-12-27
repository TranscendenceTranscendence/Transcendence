# Use a lightweight and recent Node.js image
FROM node:18.1.0-alpine3.14 AS base

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first for better caching
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY --chown=node:node . .

# Expose the application port
EXPOSE 3000

# Switch user to a non-root user
USER node

# Run the application
CMD ["npm", "start"]
