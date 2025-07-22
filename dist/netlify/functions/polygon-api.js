exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { endpoint } = event.queryStringParameters || {};
    const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

    if (!POLYGON_API_KEY) {
      console.error('❌ Polygon API key not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Endpoint parameter required' }),
      };
    }

    console.log(`🔍 Polygon API: Fetching ${endpoint}`);

    let polygonUrl;
    
    // Route to different Polygon.io endpoints
    switch (endpoint) {
      case 'sp500':
        // S&P 500 - Use SPY ETF as proxy with dynamic date range
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        const startDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
        const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        polygonUrl = `https://api.polygon.io/v2/aggs/ticker/SPY/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'market-status':
        polygonUrl = `https://api.polygon.io/v1/marketstatus/now?apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'gainers':
        // Free tier fallback: Use sample data or alternative approach
        const gainersData = {
          status: "OK",
          results: [
            { ticker: "AAPL", todaysChangePerc: 2.8, lastQuote: { lastPrice: 233.45 }},
            { ticker: "NVDA", todaysChangePerc: 2.1, lastQuote: { lastPrice: 147.82 }},
            { ticker: "MSFT", todaysChangePerc: 1.9, lastQuote: { lastPrice: 445.67 }},
            { ticker: "GOOGL", todaysChangePerc: 1.4, lastQuote: { lastPrice: 180.23 }},
            { ticker: "TSLA", todaysChangePerc: 1.2, lastQuote: { lastPrice: 415.89 }}
          ]
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(gainersData)
        };
        
      case 'losers':
        // Free tier fallback: Use sample data
        const losersData = {
          status: "OK", 
          results: [
            { ticker: "META", todaysChangePerc: -2.1, lastQuote: { lastPrice: 589.45 }},
            { ticker: "AMZN", todaysChangePerc: -1.8, lastQuote: { lastPrice: 205.67 }},
            { ticker: "NFLX", todaysChangePerc: -1.4, lastQuote: { lastPrice: 915.23 }},
            { ticker: "AMD", todaysChangePerc: -1.1, lastQuote: { lastPrice: 142.89 }},
            { ticker: "INTC", todaysChangePerc: -0.9, lastQuote: { lastPrice: 22.34 }}
          ]
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(losersData)
        };
        
      case 'indices':
        // Free tier: Get individual ticker data for major indices
        try {
          const tickers = ['SPY', 'QQQ', 'DIA'];
          const promises = tickers.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`;
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              return {
                ticker,
                prevDay: data.results?.[0] || { c: 0, o: 0 },
                change: data.results?.[0] ? ((data.results[0].c - data.results[0].o) / data.results[0].o * 100).toFixed(2) : 0
              };
            }
            return { ticker, prevDay: { c: 0, o: 0 }, change: 0 };
          });
          
          const indicesData = await Promise.all(promises);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              status: "OK",
              results: indicesData
            })
          };
        } catch (error) {
          console.error('Error fetching indices:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch indices data' })
          };
        }
        
      case 'ticker':
        const { symbol } = event.queryStringParameters;
        if (!symbol) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Symbol parameter required for ticker endpoint' }),
          };
        }
        polygonUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${POLYGON_API_KEY}`;
        break;
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid endpoint' }),
        };
    }

    console.log(`📡 Fetching from Polygon: ${polygonUrl.replace(POLYGON_API_KEY, '***')}`);

    const response = await fetch(polygonUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Polygon API error: ${response.status} ${response.statusText}`);
      console.error(`❌ Error details: ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Polygon API error: ${response.statusText}`,
          details: errorText,
          status: response.status
        }),
      };
    }

    const data = await response.json();
    
    console.log(`✅ Polygon API success for ${endpoint}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('💥 Polygon API function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
}; 