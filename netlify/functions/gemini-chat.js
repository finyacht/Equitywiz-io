const https = require('https');

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('Function called - checking environment variables...');
    console.log('Available env keys containing GEMINI:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
    console.log('API key exists:', !!apiKey);
    console.log('API key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          details: 'API key not configured',
          debug: {
            envKeysWithGemini: Object.keys(process.env).filter(key => key.includes('GEMINI')),
            allEnvKeysCount: Object.keys(process.env).length
          }
        })
      };
    }

    // Parse the request body
    const { message } = JSON.parse(event.body);
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Create the prompt for Gemini
    const prompt = `You are Yikes AI, an expert assistant for equity and cap table management.

Question: ${message}

Please provide a comprehensive, helpful response with specific actionable steps. Use bullet points (•) for lists and include practical tips where relevant. Focus on equity management, cap tables, stock options, vesting, funding rounds, and related financial instruments.`;

    // Prepare the request to Gemini API
    const geminiRequestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    // Make request to Gemini API
    const geminiResponse = await makeGeminiRequest(apiKey, geminiRequestBody);
    
    // Parse and validate the response
    if (geminiResponse.candidates && 
        geminiResponse.candidates[0] && 
        geminiResponse.candidates[0].content && 
        geminiResponse.candidates[0].content.parts[0]) {
      
      const aiResponse = geminiResponse.candidates[0].content.parts[0].text;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: aiResponse,
          source: 'gemini-ai'
        })
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get AI response',
        details: error.message,
        errorName: error.name,
        stack: error.stack,
        fallback: true,
        debug: {
          nodeVersion: process.version,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};

// Helper function to make HTTPS request to Gemini API
function makeGeminiRequest(apiKey, requestBody) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`Gemini API error: ${res.statusCode} - ${response.error?.message || 'Unknown error'}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Gemini API response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(requestBody);
    req.end();
  });
} 