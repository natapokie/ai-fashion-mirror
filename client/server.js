// client/server.js
const fs = require('fs');
const https = require('https');
const path = require('path');
const { parse } = require('url');
const next = require('next');
const dotenv = require('dotenv');

// Load environment variables from .env file in the project root
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Resolve SSL certificate paths relative to the project root
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', process.env.SSL_KEY_PATH)),
  cert: fs.readFileSync(path.resolve(__dirname, '..', process.env.SSL_CERT_PATH)),
};

// check if an IP was passed in via command line with `-H` and use it if available
const args = process.argv.slice(2);
let hostArg = 'localhost';
const hostIndex = args.indexOf('-H');
if (hostIndex !== -1 && args[hostIndex + 1]) {
  hostArg = args[hostIndex + 1];
}

const HOST = process.env.HOST || hostArg;
const PORT = 3000;

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(PORT, HOST, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${HOST}:${PORT}`);
    });
});