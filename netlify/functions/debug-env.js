exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'Debug function working',
        envVarExists: !!apiKey,
        envVarLength: apiKey ? apiKey.length : 0,
        envVarPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'Not found',
        timestamp: new Date().toISOString(),
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI')),
        nodeVersion: process.version
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Debug function error',
        message: error.message
      })
    };
  }
}; 