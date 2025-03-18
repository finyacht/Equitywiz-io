const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3002;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Waterfall Analysis Tool running at http://localhost:${port}`);
}); 