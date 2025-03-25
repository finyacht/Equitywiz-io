const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000; // Try a completely different port

// First handle specific routes before serving static files
// Route for the root path (Home page) - always serve home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for the Waterfall Analysis Tool - both with and without .html extension
app.get('/waterfall', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/waterfall.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// The index.html file is the Waterfall Analysis Tool
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the Netflix Option Modeler - both with and without .html extension
app.get('/netflix', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'netflix.html'));
});

app.get('/netflix.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

// Route for accessing the home page directly
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for the Vanilla Option Modeler
app.get('/vanilla', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'vanilla.html'));
});

// Serve static files from the current directory
// This comes AFTER route definitions to prevent conflicts
app.use(express.static(__dirname));

// Custom 404 handler - redirect to home.html ONLY for unknown routes
// Don't redirect for the tools themselves
app.use((req, res, next) => {
  // Don't redirect if the path is already for Waterfall or Netflix tools
  if (req.path.includes('/waterfall') || req.path === '/index.html' || 
      req.path.includes('/netflix')) {
    return next();
  }
  res.status(302).redirect('/');
});

// Start the server with explicit localhost binding
app.listen(port, 'localhost', () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
}); 