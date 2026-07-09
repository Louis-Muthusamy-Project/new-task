require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initStoreSocket } = require('./src/services/store/storeSocket');

const PORT = process.env.PORT || 5500;

// Socket.io needs the raw http.Server (not the Express app) so it can
// upgrade connections on the same port Express already listens on — no
// second port, no separate process, same CORS/origin story as the REST
// API. See services/store/storeSocket.js for what actually flows over
// this connection (Admin dashboard real-time sync) and why the public
// storefront intentionally keeps using SSE instead.
const httpServer = http.createServer(app);
initStoreSocket(httpServer, { corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*' });

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on :${PORT}`);
});