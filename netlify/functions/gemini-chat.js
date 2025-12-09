// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API call with retry logic
async function callGeminiWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited (429), wait and retry
      if (response.status === 429) {
        if (attempt < retries) {
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`Rate limited (429). Retrying in ${retryDelay}ms... (attempt ${attempt}/${retries})`);
          await delay(retryDelay);
          continue;
        }
        return {
          ok: false,
          status: 429,
          errorMessage: 'Rate limit exceeded. Please wait a moment and try again.'
        };
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          ok: false,
          status: response.status,
          errorMessage: errorText
        };
      }
      
      const data = await response.json();
      return { ok: true, data };
      
    } catch (error) {
      if (attempt < retries) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Request failed. Retrying in ${retryDelay}ms... (attempt ${attempt}/${retries})`);
        await delay(retryDelay);
        continue;
      }
      throw error;
    }
  }
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Gemini API key not configured' })
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (error) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  let geminiRequestBody;
  
  if (requestBody.message) {
    const { message, history = [] } = requestBody;
    
    let conversationText = `You are Yikes AI, a specialized assistant for equity and cap table management.

**YOUR KNOWLEDGE SOURCE:**
- Cap Table & Compliance Management
- Stakeholder Management & Participant Portals
- Share Transactions & Equity Grant Administration
- Vesting Schedules & Plan Management
- Option Exercise & Release Processes
- Round Modeling & Convertible Instruments

**RESPONSE FORMAT:**
Use bullet points and be comprehensive. End with a practical tip.

`;
    
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    });
    
    conversationText += `User: ${message}\nAssistant:`;
    
    geminiRequestBody = {
      contents: [{
        parts: [{ text: conversationText }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };
  } else {
    geminiRequestBody = requestBody;
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const result = await callGeminiWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequestBody)
    });

    if (!result.ok) {
      let userMessage = result.errorMessage;
      if (result.status === 429) {
        userMessage = 'AI is temporarily busy. Please wait 10-15 seconds and try again.';
      } else if (result.status === 403) {
        userMessage = 'API key issue. Please check your Gemini API key configuration.';
      } else if (result.status === 400) {
        userMessage = 'Invalid request. Please try a shorter or simpler query.';
      }
      
      return { 
        statusCode: result.status, 
        headers,
        body: JSON.stringify({ 
          error: userMessage,
          status: result.status,
          retryable: result.status === 429
        })
      };
    }

    const data = result.data;

    if (requestBody.message && !requestBody.contents) {
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        const responseText = data.candidates[0].content.parts[0].text;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            response: responseText,
            source: 'gemini-ai' 
          })
        };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

  } catch (error) {
    console.error('Function Error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'AI service temporarily unavailable. Please try again.',
        details: error.message,
        retryable: true
      })
    };
  }
};
