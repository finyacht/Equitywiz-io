const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

// Create Express app
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../..')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// Handle all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// Export the serverless function
exports.handler = serverless(app); 