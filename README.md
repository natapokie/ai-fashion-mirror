# ai-fashion-mirror

## Getting started
This project uses the node v20.16.0 (LTS) and npm 10.8.1.

First, we'll need to install frontend and backend dependencies.

```shell
cd client
npm i
cd ../server
npm i
```

## Running the Code
Currently, you will have the run with frontend and backend in two different terminals.

*Note: if you notice that there is 1 high vulnerability after installing dependencies on the the client side, it's because we needed to downgrade to Next v13 as Next v14 is not working on the raspberry pi*

```shell
# in one terminal start the client
cd client
npm run dev
```

```shell
# in another terminal start the server
cd server
npm run dev
```