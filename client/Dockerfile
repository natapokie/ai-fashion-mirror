# Use a base image
FROM node:20.16.0-alpine

# Set the working directory
WORKDIR /client

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code and the shared directory
COPY . .
COPY ../shared /client/shared

# Expose the port on which the application will run
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "run", "dev"]