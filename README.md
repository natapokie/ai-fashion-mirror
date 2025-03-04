# ai-fashion-mirror

## Getting started

This project uses the node v20.16.0 (LTS) and npm 10.8.1.

### Installing Dependencies

First, we'll need to install frontend, backend dependencies and root dependencies.

```shell
npm i
cd client
npm i
cd ../server
npm i
```

### Setting up IDE

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

### Environment Variables

This project uses an `.env` file to store environment variables along with [dotenv](https://www.npmjs.com/package/dotenv) package to load these variables.

The `.env` file is placed at the root. It is configured on the server in `server.ts` and configured on the client in `next.config.js`.

## Running the Code

Currently, you will have the run with frontend and backend in two different terminals.

_Note: if you notice that there is 1 high vulnerability after installing dependencies on the the client side, it's because we needed to downgrade to Next v13 as Next v14 is not working on the raspberry pi_

**Generating Certificates**

1. Install mkcert
    1. for MAC: run brew install mkcertand mkcert -install
    2. for Windows: download latest release https://github.com/FiloSottile/mkcert/releases, and run mkcert -install
2. At root of the repo, create an ```ssl``` folder by ```mkdir ssl``` and then ```cd ssl```            
3. Generate certificate and key for a specific IP address:
    1. mkcert -key-file <ip-address>-key.pem -cert-file <ip-address>.pem <ip-address>
NOTE: If your local IP address changes, you’ll need to regenerate the SSL certificate and key files to match your new IP address!
Using OpenSSL (alternative)

**Configure ```.env``` for the SSL Paths**

```shell
SSL_KEY_PATH=./ssl/<ip-address>-key.pem
SSL_CERT_PATH=./ssl/<ip-address>.pem
```

**Running client and server**

```shell
# for prototype 2, run client with HTTPS
# in one terminal start the client
cd client
npm run dev -- --experimental-https -H <ip_address>
```

```shell
# in another terminal start the server
cd server
npm run dev
```

**Running with Docker:**

Make sure you have Docker Desktop installed, to install Docker Desktop use the following [link](https://www.docker.com/products/docker-desktop/).

From the **root** repository run:

_Note: The server does not build due to node-webcam (future todo!)_

```shell
# rebuilds the images for all services (client and server) in the compose.yaml
docker-compose up --build
```

## Camera

### Testing with the RPi Camera Module

A forked version of the [pi-camera-connect](https://www.npmjs.com/package/pi-camera-connect) package is used to connect the server with the Raspberry Pi Camera Module.

The forked version supports `rpicam-still` and `rpicam-vid`. See [here](https://projects.raspberrypi.org/en/projects/getting-started-with-picamera/3) for more info on the RPi Camera Module.

### Testing without the RPi Camera Module

The [node-wecam](https://www.npmjs.com/package/node-webcam) package is used to connect the server to your local device's camera, if you're not on the Raspberry Pi.

Installation steps can be found on the link above.

#### More Detailed Steps for Windows

1. Install [Visual Studio](https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170) with C/C++ support in order to run the Makefile. Make sure to select the workload, **Desktop development with C++**
2. Install [Cygwin](https://cygwin.com/install.html). Follow the steps [here](https://github.com/lakelse/videos/tree/90d2e365e07b365795852fcd679eb93be5d8b6f7/01-install-cygwin-on-windows-youtube) for a detailed installation guide. Once the installer prompts you to Select Pacakges, select the [**make**](https://earthly.dev/blog/makefiles-on-windows/#:~:text=make%20%2Dv.-,Cygwin,-Historically%2C%20one%20of) package.
3. Run the [**vcvarsall.bat**](https://learn.microsoft.com/en-us/cpp/build/building-on-the-command-line?view=msvc-170) file with your specified architecutre. This file is found in your Program Files, e.g., `C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build`
   ```shell
   # cd into the directory that the .bat file is located, and run with your architecutre
   .\vcvarsall.bat amd64
   ```
4. Open the Cygwin terminal

   ```shell
   # verify that make has been installed
   make --version

   # navigate to your device's root directory
   cd /cygdrive/c

   # cd to the repo containing node-webcam, e.g.
   cd ai-fashion-mirror/server/node_modules/node-webcam/src/bindings/CommandCam

   # run make
   make
   ```
