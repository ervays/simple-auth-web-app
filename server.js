const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Middleware to inject the API_URL environment variable
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' " + API_URL);
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