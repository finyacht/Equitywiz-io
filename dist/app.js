const express = require('express');
const path = require('path');
const app = express();
const port = 4000; // Try a completely different port

// First handle specific routes before serving static files
// Route for the root path (Home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Also handle /index.html route to redirect to home
app.get('/index.html', (req, res) => {
  res.redirect('/');
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

// Start the server with explicit localhost binding
app.listen(port, 'localhost', () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
}); 