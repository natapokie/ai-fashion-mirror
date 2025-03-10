---
layout: default
title: Getting Started
has_children: true
nav_order: 2
---

# Getting Started

Welcome to the AI Fashion Mirror & AI Shop Pal documentation! This guide will walk you through setting up and running the application, understanding the monorepo structure, configuring environment variables, and enabling HTTPS.

## Project Structure (Monorepo Overview)

This project follows a monorepo structure with three main directories:

- `client/` – The frontend built with Next.js
- `server/` – The backend using Express.js
- `database/` – Manages web scraping and data upserting

## Prerequisites

Before running the project, ensure you have the required dependencies installed.

Common Prerequisites (Required for Both Client & Server)
- Node.js v20.16.0 (LTS)
- npm v10.8.1

Server-Specific Prerequisites
- mkcert (For generating SSL certificates in order to use HTTPS)

Database-Specific Prerequisites
- Miniconda (For managing Python dependencies)

Before running the project, ensure you have the required dependencies installed.

| Component  | Required Dependencies |
|------------|----------------------|
| **Client**  | Node.js (`v20.16.0`), npm (`v10.8.1`) |
| **Server**  | Node.js (`v20.16.0`), npm (`v10.8.1`), mkcert (for SSL) |
| **Database** | Miniconda (for Python dependencies) |

For detailed installation steps, refer to the Installation Guide.

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

## Setting Up Environment Variables

This project uses an `.env` file to store environment variables along with [dotenv](https://www.npmjs.com/package/dotenv) package to load these variables.

The `.env` file is placed at the root. It is configured on the server in `server.ts` and configured on the client in `next.config.js`.

| **Variable**              | **Description**                           | **Example Value** |
|--------------------------|-------------------------------------------|------------------|
| `SERVER_PORT`            | Backend server port                      | `8081` |
| `PREAPI_URL`             | External API URL                         | `"https://pre.cm/scribe.php"` |
| `CLIENT_BASE_URL`        | Base URL for the client application (note the **https**)     | `https://172.18.131.110:3000` |
| `SERVER_BASE_URL`        | Base URL for the backend (note the **https**)                | `https://172.18.131.110:8081` |
| `USE_MOCK_DATA`          | Enable mock data (true/false)            | `true` |
| `SSL_KEY_PATH`           | Path to the SSL key                      | `./ssl/your-ip-key.pem` |
| `SSL_CERT_PATH`          | Path to the SSL certificate              | `./ssl/your-ip.pem` |
| `OPENAI_API_KEY`         | API key for OpenAI services              | `"your_openai_key"` |
| `PINECONE_API_KEY`       | API key for Pinecone                     | `"your_pinecone_key"` |
| `PINECONE_INDEX_NAME`    | Pinecone index name                      | `"your_index"` |
| `PINECONE_NAMESPACE`     | Pinecone namespace                       | `"your_namespace"` |
| `PINECONE_EMBEDDING_MODEL` | Model used for embeddings               | `"text-embedding"` |

📌 **Make sure to replace `<your-ip>` with your actual IP address!**

## Enabling HTTPS with SSL Configuration

To enable HTTPS, you need an SSL certificate. We use `mkcert`.

1. Install `mkcert`
    - **Mac:**
        ```sh
        brew install mkcertand mkcert -install
        ```
        for MAC: run brew install mkcertand mkcert -install
    - **Windows:** Download the latest release from [GitHub](https://github.com/FiloSottile/mkcert/releases), then run
        ```sh
        mkcert -install
        ```
2. Verify that `mkcert` is installed correctly:
    
    Run the following command to check if mkcert is recognized:
    
    ```sh
    mkcert -help
    ```

    If the installation is successful, you should see a list of available mkcert commands.

3. At root of the repo, create an `ssl` folder

    ```sh
    mkdir ssl && cd ssl
    ```

4. Generate a certificate for your IP:

    ```sh
    mkcert -key-file <your-ip>-key.pem -cert-file <your-ip>.pem <your-ip>
    ```

### Updating `.env` for SSL

Once your certificate is generated, update the `.env` file:

```sh
CLIENT_BASE_URL=https://<your-ip>:3000
SERVER_BASE_URL=https://<your-ip>:8081

SSL_KEY_PATH=./ssl/<your-ip>-key.pem
SSL_CERT_PATH=./ssl/<your-ip>.pem
```

**📌 Note:** If your local IP address changes, you’ll need to regenerate the SSL certificate and key files to match your new IP address!

### Using Local IP Address

If you'd like to run the application on your local network, you need your **local IP address**. 

- **Mac:**
    1. Run:
        ```sh
        ifconfig
        ```
        Look for **inet**

- **Windows:**
    1. Run:
        ```sh
        ipconfig
        ```
        Look for the **IPv4 Address** under your active network connection.

## Running the Application

Currently, you will have the run with frontend and backend in two different terminals.

_Note: if you notice that there is 1 high vulnerability after installing dependencies on the the client side, it's because we needed to downgrade to Next v13 as Next v14 is not working on the raspberry pi_

### Installing Dependencies

First, we'll need to install frontend, backend dependencies and root dependencies.

```shell
npm i
cd client
npm i
cd ../server
npm i
```

### Running with Terminal

```shell
# for prototype 2, run client with HTTPS
# in one terminal start the client
cd client
npm run dev -- --experimental-https -H <your-ip>
```

```shell
# in another terminal start the server
cd server
npm run dev
```

### Running with Docker (TODO)

TODO!!

Make sure you have Docker Desktop installed, to install Docker Desktop use the following [link](https://www.docker.com/products/docker-desktop/).

```shell
# rebuilds the images for all services (client and server) in the compose.yaml
docker-compose up --build
```