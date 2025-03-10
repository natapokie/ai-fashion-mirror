---
layout: default
title: Server
parent: ProjectArchitecture
---

# Server

The server for the AI Fashion Mirror project is built using Express.js. It serves as the backbone for handling HTTP requests, routing, and middleware management.

Ensure that dependencies are installed and SSL is setup.

```shell
cd server
npm run dev
```

See [Getting Started](../GettingStarted/GettingStarted.md#Running-the-Application) for more details.

## Running Tests

The project uses Jest for unit testing, with test files located in the __tests__ directory.

```sh
cd client 
npm run test
```

## API Documentation

[Swagger](https://swagger.io/) is used for documenting and testing the API endpoints.

After running the server, it can be viewed at `/api-docs`.


## Key Directories & Their Roles

- `controllers/`
    - Contains controller files that handle the business logic for various routes.

- `routes/`
    - Defines API routes for the application, mapping HTTP requests to controller functions.

- `sockets/` (used for Prototype 1)
    - Manages WebSocket connections for real-time communication between the client and the server.

- `services/`
    - Contains business logic for interacting with external services like Pinecone or internal utilities.

- `swagger/`
- Provides API documentation using Swagger, 

- `pi-camera-connect/` (used for Prototype 1)
    - Handles logic related to the Raspberry Pi camera connection for the smart mirror functionality. A copy of [pi-camera-connect](https://github.com/launchcodedev/pi-camera-connect), with some changes to work with our app

- `utils/`
    - Stores helper functions that simplify logic and tasks across the server.

- `multer.ts`
    - Manages file uploads using the [multer](https://www.npmjs.com/package/multer) middleware for handling multipart form data (e.g., image uploads).

- `app.ts`
    - The main application file responsible for configuring and initializing Express middleware and routes.

- `server.ts`
    - The entry point for the server, where the Express app is started and the server is bound to a port.

 