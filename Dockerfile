# Use official Node.js Alpine image for a smaller footprint
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY src/ ./src/

# Expose the API port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
