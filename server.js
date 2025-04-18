const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://auth-api:5000';

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Set up proxy for API requests
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // keep the /api prefix
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Proxy Error', message: err.message });
  },
  logLevel: 'debug'  // Change to 'info' or 'silent' in production
}));

// Middleware to set Content Security Policy
app.use((req, res, next) => {
  // Allow connections to self only - API requests will be proxied through our server
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'");
  next();
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Proxying API requests to ${API_URL}`);
});