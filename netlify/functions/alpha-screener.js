// Alpha Vantage powered endpoints for the Stock Screener
// Env: ALPHAVANTAGE_API_KEY

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  const ALPHA = process.env.ALPHAVANTAGE_API_KEY;
  if (!ALPHA) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ALPHAVANTAGE_API_KEY not configured' }) };

  const { endpoint, symbol = 'SPY', interval = '5min', size = 'compact', market = 'US' } = event.queryStringParameters || {};

  try {
    const { default: fetch } = await import('node-fetch');

    async function alpha(pathParams) {
      const url = new URL('https://www.alphavantage.co/query');
      Object.entries(pathParams).forEach(([k, v]) => url.searchParams.set(k, v));
      url.searchParams.set('apikey', ALPHA);
      const res = await fetch(url.toString());
      const json = await res.json();
      return json;
    }

    // Basic router
    if (endpoint === 'intraday') {
      const data = await alpha({ function: 'TIME_SERIES_INTRADAY', symbol, interval, outputsize: size });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (endpoint === 'quote') {
      const data = await alpha({ function: 'GLOBAL_QUOTE', symbol });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (endpoint === 'top-movers') {
      // Use Alpha Intelligence Top Gainers & Losers
      const gainers = await alpha({ function: 'TOP_GAINERS_LOSERS', market });
      return { statusCode: 200, headers, body: JSON.stringify(gainers) };
    }

    if (endpoint === 'search') {
      const { keywords = '' } = event.queryStringParameters || {};
      const data = await alpha({ function: 'SYMBOL_SEARCH', keywords });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (endpoint === 'screener') {
      // Simple screener using LISTING_STATUS + GLOBAL_QUOTE per symbol (batched small)
      const { minCap = '0', maxCap = '999999999999', minVol = '0', maxVol = '999999999999', limit = '50' } = event.queryStringParameters || {};
      const list = await alpha({ function: 'LISTING_STATUS' });
      const rows = list?.data || list; // CSV-like in premium; fallback to json if available
      // If response not suitable, return an informative message
      if (!rows || !Array.isArray(rows)) {
        return { statusCode: 200, headers, body: JSON.stringify({
          note: 'Alpha Vantage LISTING_STATUS may require premium CSV parsing. For demo, please provide a symbols param to screen a subset.'
        }) };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid endpoint' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

