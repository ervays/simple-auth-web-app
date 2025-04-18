const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://13.51.234.173:5000'; // Updated default to your remote API

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Middleware to inject the API_URL environment variable
app.use((req, res, next) => {
  // More permissive CSP that allows connections to any origin
  // This is fine for development but should be tightened for production
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:5000 http://13.51.234.173:5000 *");
  next();
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Add API_URL to the window object
app.get('/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`window.API_URL = "${API_URL}";`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Connected to API at ${API_URL}`);
});