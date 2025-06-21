const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000; // Changed from 4000 to 3000

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

// Route for the Interest Rate Calculator
app.get('/interest-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'interest-calculator.html'));
});

app.get('/interest-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'interest-calculator.html'));
});

// Route for the Budget & Finances Modeler
app.get('/budget-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'budget-calculator.html'));
});

app.get('/budget-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'budget-calculator.html'));
});

// Route for the Grant Calculator
app.get('/grant-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'grant-calculator.html'));
});

app.get('/grant-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'grant-calculator.html'));
});

// Route for the Chatbot Demo
app.get('/chatbot-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot-demo.html'));
});

app.get('/chatbot-demo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot-demo.html'));
});

// Serve static files from the current directory
// This comes AFTER route definitions to prevent conflicts
app.use(express.static(__dirname));

// Custom 404 handler
app.use((req, res) => {
  // Don't redirect tool routes
  if (req.path.includes('calculator') || req.path.includes('modeler')) {
    res.sendFile(path.join(__dirname, req.path + '.html'));
  } else {
    res.redirect('/home');
  }
});

// Start the server listening on all interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
  console.log(`You can also try http://127.0.0.1:${port}`);
  
  // Try to open the browser window automatically
  try {
    console.log('Attempting to open browser window...');
    // For Windows
    exec(`start http://localhost:${port}/budget-calculator`);
  } catch (err) {
    console.error('Failed to open browser window:', err);
  }
}).on('error', (err) => {
  console.error('Error starting server:', err);
}); 