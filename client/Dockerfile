# Use a base image
FROM node:20.16.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

RUN ls

# Copy the rest of the application code and the shared directory
COPY ./client ./
COPY ./shared ../shared

# Expose the port on which the application will run
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "run", "dev"]