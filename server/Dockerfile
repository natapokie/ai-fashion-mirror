# Use a base image
FROM node:20.16.0-alpine

# Set the working directory
# WORKDIR /client

# let's use a more "default name?", i see app being used a lot
# this is our working directory in our docker container
WORKDIR /app

# Copy package.json and package-lock.json to WORKDIR
COPY package*.json ./

# instead of using npm install, we can use npm ci
# the main reason why we also included the package-lock.json is so that we can use ci
# ci is best for continuous developments and ensures that there's no mismatched packages
RUN npm ci

# Copy the rest of the application code and the shared directory
# COPY . .
# COPY ../shared /client/shared

# when thinking about copying our repo files into WORKDIR,
# in order to have access to /shared, we want to run the docker build commands from the root
# we want to copy the server folder only our WORKDIR
RUN ls

COPY ./server ./
# and we want to copy the shared folder,
# COPY ./shared ../shared


# Expose the port on which the application will run
EXPOSE 8081

# Define the command to start the application
CMD ["npm", "run", "dev"]