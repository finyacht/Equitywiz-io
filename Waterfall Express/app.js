const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Import waterfall calculator
const waterfallCalculator = require('./utils/waterfallCalculator');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// API endpoint for initial data
app.get('/api/initial-data', (req, res) => {
  try {
    // Return default data from the waterfall calculator
    res.json({
      shareClasses: waterfallCalculator.DEFAULT_SHARE_CLASSES,
      transactions: waterfallCalculator.DEFAULT_TRANSACTIONS
    });
  } catch (error) {
    console.error('Error fetching initial data:', error);
    res.status(500).json({ error: 'Error fetching initial data' });
  }
});

// API endpoint for waterfall calculation
app.post('/api/calculate', (req, res) => {
  const { shareClasses, transactions, exitAmount } = req.body;
  
  try {
    // Perform calculations
    const detailed = waterfallCalculator.calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
    const summary = waterfallCalculator.calculateSummaryWaterfall(shareClasses, transactions, exitAmount);
    
    // Return the results
    res.json({
      detailed,
      summary
    });
  } catch (error) {
    console.error('Error calculating waterfall:', error);
    res.status(500).json({ error: 'Error calculating waterfall' });
  }
});

// API endpoint for exit distribution calculation
app.post('/api/calculate-exit-distribution', (req, res) => {
  const { shareClasses, transactions, maxExitAmount, numPoints } = req.body;
  
  try {
    // Calculate exit distribution
    const exitDistribution = waterfallCalculator.calculateExitDistribution(
      shareClasses, 
      transactions, 
      maxExitAmount,
      numPoints || 20
    );
    
    // Return the results
    res.json(exitDistribution);
  } catch (error) {
    console.error('Error calculating exit distribution:', error);
    res.status(500).json({ error: 'Error calculating exit distribution' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Waterfall Analysis Tool running at http://localhost:${port}`);
}); 