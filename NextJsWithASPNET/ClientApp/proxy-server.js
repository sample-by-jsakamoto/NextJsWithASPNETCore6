const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
const express = require('express');
const { env } = require('process');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config({ path: ".env.development" })
dotenv.config({ path: ".env.development.local" })

const aspNetCoreServerUrl =
  env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7294';
const nextjsDevServerUrl = `http://localhost:${env.NEXTJS_PORT}`;

const app = express();
const server = https.createServer({ cert: fs.readFileSync(env.SSL_CRT_FILE), key: fs.readFileSync(env.SSL_KEY_FILE), }, app);

const context = [
  "/weatherforecast",
];

// Forward to the ASP.NET Core server
app.use(createProxyMiddleware(context, {
  target: aspNetCoreServerUrl,
  secure: false,
  headers: {
    Connection: 'Keep-Alive'
  }
}));

// Forward to the Next.js dev server
app.use(createProxyMiddleware({
  target: nextjsDevServerUrl,
  secure: false,
  headers: {
    Connection: 'Keep-Alive'
  }
}));

server.listen(env.PORT, () => {
  console.log(`Now listening on: https://localhost:${env.PORT}`);
});

