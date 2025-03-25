const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000; // Try a completely different port

// Create a simple counter repository
let visitCounter = 0;

// Try to load visit count from a file
const counterFilePath = path.join(__dirname, 'visit-counter.json');
try {
    if (fs.existsSync(counterFilePath)) {
        const data = fs.readFileSync(counterFilePath, 'utf8');
        const counterData = JSON.parse(data);
        visitCounter = counterData.count || 0;
        console.log(`Loaded visit counter: ${visitCounter}`);
    } else {
        // Create the file if it doesn't exist
        fs.writeFileSync(counterFilePath, JSON.stringify({ count: 0 }), 'utf8');
        console.log('Created new visit counter file');
    }
} catch (err) {
    console.error('Error with counter file:', err);
    // If there's an error, just start with 0
}

// Save counter to file
const saveCounter = () => {
    try {
        fs.writeFileSync(counterFilePath, JSON.stringify({ count: visitCounter }), 'utf8');
    } catch (err) {
        console.error('Error saving counter:', err);
    }
};

// Track unique visitors using a session cookie
app.use((req, res, next) => {
    // Use an object to store visited IPs
    if (!req.app.locals.visitedIPs) {
        req.app.locals.visitedIPs = new Set();
    }
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Increment counter only if this IP hasn't been seen in this server session
    if (!req.app.locals.visitedIPs.has(clientIP) && req.path === '/') {
        req.app.locals.visitedIPs.add(clientIP);
        visitCounter++;
        saveCounter();
        console.log(`New visitor (${clientIP}). Visit counter incremented to: ${visitCounter}`);
    }
    
    next();
});

// API endpoint to get the visit counter (without incrementing)
app.get('/api/visit-count', (req, res) => {
    try {
        res.json({ count: visitCounter });
    } catch (error) {
        console.error('Error in visit counter API:', error);
        res.status(500).json({ error: 'Server error', count: visitCounter });
    }
});

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