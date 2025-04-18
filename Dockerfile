FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose the app port
EXPOSE 8080

# Set environment variable for API URL (can be overridden)
ENV API_URL=http://localhost:5000

# Start the application
CMD ["node", "server.js"]