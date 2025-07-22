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
        // S&P 500 - Use SPY ETF as proxy
        polygonUrl = `https://api.polygon.io/v2/aggs/ticker/SPY/range/1/day/2023-01-01/2024-12-31?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'market-status':
        polygonUrl = `https://api.polygon.io/v1/marketstatus/now?apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'gainers':
        polygonUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'losers':
        polygonUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?apikey=${POLYGON_API_KEY}`;
        break;
        
      case 'indices':
        // Major indices - we'll get SPY, QQQ, DIA, VIX
        polygonUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=SPY,QQQ,DIA,VIX&apikey=${POLYGON_API_KEY}`;
        break;
        
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