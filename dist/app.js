const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// First handle specific routes before serving static files
// Route for the root path (Home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for the Waterfall Analysis Tool
app.get('/waterfall', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the Netflix Option Modeler (placeholder)
app.get('/netflix', (req, res) => {
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

// Serve static files from the current directory
// This comes AFTER route definitions to prevent conflicts
app.use(express.static(__dirname));

// Start the server with explicit host binding to all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
  console.log(`Also try http://127.0.0.1:${port} if localhost doesn't work`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please close the application using this port or try a different port.`);
  } else {
    console.error('Error starting server:', err);
  }
}); 