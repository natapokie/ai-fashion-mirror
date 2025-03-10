---
layout: default
title: Client
parent: ProjectArchitecture
---

# Client

The `client/` folder contains the **frontend** of the application, built with **Next.js**.

Ensure that dependencies are installed.

```shell
cd client
npm run dev -- --experimental-https -H <ip_address>
```

See [Getting Started](../GettingStarted/GettingStarted.md#Running-the-Application) for more details.

## Running Tests

The project uses Jest for unit testing, with test files located in the __tests__ directory.

```sh
cd client 
npm run test
```


## Key Directories & Their Roles

- `components/`
    - Contains **reusable UI components**
- `context/`
    -  Stores **React Context API providers** for state management.
- `pages/`
    - Contains **Next.js pages**.
        - `index.ts` is our main page
        - `backend.ts` and `feedback.ts` are used for Prototype 1

- `services/`
    - Handles **API requests and external integrations**.

- `styles/`
    - Contains global styles.


- `utils/`
    - Stores **helper functions** that simplify logic across the project.


## Configuration & Build Tools

- `next.config.js`
    - Loads environment variables from `.env` file using `dotenv` and exposes them to the Next.js application. 

- `tsconfig.json`
    - Defines **TypeScript settings** for the project.

- `Dockerfile`
    - Instructions for **containerizing** the Next.js app.
