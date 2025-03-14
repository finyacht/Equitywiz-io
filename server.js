// This file is used by Netlify to serve the static files
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Log startup information
console.log('Starting Waterfall Analysis Tool server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Current directory: ${__dirname}`);

// Serve static files
app.use(express.static(__dirname));

// Route for the root path and all other paths (SPA routing)
app.get('*', (req, res) => {
  console.log(`Received request for: ${req.url}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Waterfall Analysis Tool running at http://localhost:${port}`);
}); 