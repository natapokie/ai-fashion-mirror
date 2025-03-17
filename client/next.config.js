/** @type {import('next').NextConfig} */
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config({
//   path: path.resolve(__dirname, '../.env'),
// });

const nextConfig = {
  reactStrictMode: true,
  // env: {
  //   SERVER_PORT: process.env.SERVER_PORT,
  //   PREAPI_URL: process.env.PREAPI_URL,
  //   CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
  //   SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  //   NEXT_PUBLIC_SERVER_BASE_URL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  // },
};

module.exports = nextConfig;
