# Use a Node.js base image
FROM node:lts

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY src/ .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the server
CMD ["npm", "start"]
