const express = require('express');
const path = require('path');
const app = express();
const port = 4000; // Try a completely different port

// First handle specific routes before serving static files
// Route for the root path (Home page)
app.get('/', (req, res) => {
  console.log('Home page requested');
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Also handle /index.html route to redirect to home
app.get('/index.html', (req, res) => {
  console.log('Redirecting /index.html to home');
  res.redirect('/');
});

// Route for the Waterfall Analysis Tool - both with and without .html extension
app.get('/waterfall', (req, res) => {
  console.log('Waterfall page requested');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/waterfall.html', (req, res) => {
  console.log('Waterfall.html page requested');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the Netflix Option Modeler - both with and without .html extension
app.get('/netflix', (req, res) => {
  console.log('Netflix page requested');
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

app.get('/netflix.html', (req, res) => {
  console.log('Netflix.html page requested');
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

// Route for accessing the home page directly
app.get('/home', (req, res) => {
  console.log('Home direct page requested');
  res.redirect('/');
});

app.get('/home.html', (req, res) => {
  console.log('Home.html direct page requested');
  res.redirect('/');
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