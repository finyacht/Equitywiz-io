const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3002;

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

// Start the server
app.listen(port, () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
}); 