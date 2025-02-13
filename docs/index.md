---
title: Home
layout: home
nav_order: 1
---

# Getting started

This project uses the node v20.16.0 (LTS) and npm 10.8.1.

## Installing Dependencies

First, we'll need to install frontend, backend dependencies and root dependencies.

```shell
npm i
cd client
npm i
cd ../server
npm i
```

## Setting up IDE

This project uses [Prettier](https://prettier.io/) and [ESLint](eslint.org) for automatic formatting and fixing.

Make sure to configure your [editor](https://prettier.io/docs/en/editors) to allow Prettier/ESLint on save.

1. On VSCode install the **Prettier - Code formatter** extension and **ESLint** extention. Once installed and enabled, you may need to restart VSCode.
2. Set the **Prettier: Config Path**
    1. Open Settings using shortcut `Ctrl / Cmd + ,`
    2. Right click on `.prettierrc` and click Copy Path, Set **Prettier: Config Path** to that path, e.g. `/home/user/ai-fashion-mirror/.prettierrc`
3. Integrate with editor:
    1. File > Preferences > Settings
    2. Search for 'formatter'
    3. Set **Default Formatter** to **Prettier - Code formatter**
    4. Check **Editor: Format On Save**

## Environment Variables

This project uses an `.env` file to store environment variables along with the [dotenv](https://www.npmjs.com/package/dotenv) package to load these variables.

The `.env` file is placed at the root. It is configured on the server in `server.ts` and configured on the client in `next.config.js`.

# Running the Code

Currently, you will have the run with frontend and backend in two different terminals.


## Running the Frontend

_Note: if you notice that there is 1 high vulnerability after installing dependencies on the the client side, it's because we needed to downgrade to Next v13 as Next v14 is not working on the raspberry pi_

```shell
# for prototype 2, run client with HTTPS
# in one terminal start the client
cd client
npm run dev -- --experimental-https -H <ip_address>
```

## Running the Backend

```shell
# in another terminal start the server
cd server
npm run dev
```

## Running the Frontend and Backend with Docker

Make sure you have Docker Desktop installed, to install Docker Desktop use the following [link](https://www.docker.com/products/docker-desktop/).

From the **root** repository run:

_Note: The server does not build due to node-webcam (future todo!)_

```shell
# rebuilds the images for all services (client and server) in the compose.yaml
# navigate to the root of the repo
cd .
docker-compose up --build
```

## Running the Scraper

<!-- TODO -->

## Running the Docs

Note that running `docker-compose` from the previous step will also run just-the-docs on port 4000.

```shell
# if you want to run the docs separately...

# navigate to root
cd . 

# build the docker image with name "just-the-docs" or anyname is good!
docker build -f ./docs/Dockerfile  -t just-the-docs .

# run the container
# 4000:4000 exposes the port inside the container (second 4000) to the port on your local machine (first 4000)
docker run -p 4000:4000 just-the-docs

# mounting the local docs folder into /app folder in container (mounting volumes)
docker run -p 4000:4000 -v $(pwd)/docs:/app just-the-docs
```


hellloooo