const https = require('https');

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API call with retry logic
async function callGeminiWithRetry(fetch, url, options, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited (429), wait and retry
      if (response.status === 429) {
        if (attempt < retries) {
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Rate limited (429). Retrying in ${retryDelay}ms... (attempt ${attempt}/${retries})`);
          await delay(retryDelay);
          continue;
        }
        // Last attempt failed with 429
        return {
          ok: false,
          status: 429,
          errorMessage: 'Rate limit exceeded. Please wait a moment and try again. (Free tier: 60 requests/minute)'
        };
      }
      
      // If other error, return immediately
      if (!response.ok) {
        const errorText = await response.text();
        return {
          ok: false,
          status: response.status,
          errorMessage: errorText
        };
      }
      
      // Success
      const data = await response.json();
      return { ok: true, data };
      
    } catch (error) {
      if (attempt < retries) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`⚠️ Request failed. Retrying in ${retryDelay}ms... (attempt ${attempt}/${retries})`);
        await delay(retryDelay);
        continue;
      }
      throw error;
    }
  }
}

exports.handler = async function(event, context) {
  // Handle CORS
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

  // Get API key from environment
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

  console.log('🤖 Netlify Function: Received request');
  console.log('🔑 API Key present:', !!apiKey);

  // Handle both chatbot and neon-cycles request formats
  let geminiRequestBody;
  
  if (requestBody.message) {
    // Neon Cycles / Game format
    const { message, history = [] } = requestBody;
    
    // Build conversation for Gemini
    let conversationText = `You are Yikes AI, a specialized assistant for equity and cap table management based on comprehensive platform user guides.

**YOUR KNOWLEDGE SOURCE:**
You are trained on comprehensive user guides covering:
- Cap Table & Compliance Management
- Stakeholder Management & Participant Portals
- Share Transactions & Equity Grant Administration
- Vesting Schedules & Plan Management
- Option Exercise & Release Processes
- Round Modeling & Convertible Instruments
- Warrant Management & Board Approvals
- Document Management & Compliance Reporting
- Company Overview & Administrative Functions

**CRITICAL RESPONSE REQUIREMENTS:**
1. NEVER limit to 3 steps - provide COMPLETE workflows (6-12 action points as needed)
2. Use bullet points (•) NOT numbered steps
3. Each action point should be on a new line
4. Include ALL necessary actions for complete workflow
5. Be thorough and comprehensive - don't skip important actions
6. End with a practical tip using 💡

**RESPONSE FORMAT:**
• [First action with specific details]

• [Second action with platform specifics]

• [Third action continuing the workflow]

• [Fourth action with more details]

• [Fifth action as needed]

• [Continue with as many actions as required for complete workflow]

• [Final action to complete the process]

💡 Tip: [Practical advice for best results]

IMPORTANT: Always provide comprehensive workflows with 6-12+ action points. Never stop at just 3 actions.\n\n`;
    
    // Add conversation history
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
    // Chatbot format - pass through as-is
    geminiRequestBody = requestBody;
  }

  try {
    console.log('📤 Calling Gemini API...');
    
    // Use dynamic import for fetch
    const { default: fetch } = await import('node-fetch');
    
    // Use gemini-1.5-flash for better rate limits and stability
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const result = await callGeminiWithRetry(fetch, apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequestBody)
    });

    if (!result.ok) {
      console.error('❌ Gemini API Error:', result.errorMessage);
      
      // Provide user-friendly error messages
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

    console.log('✅ Gemini API Success');
    const data = result.data;

    // Check if this is a chatbot request (expects specific format)
    if (requestBody.message && !requestBody.contents) {
      // Chatbot format - extract the text and return in expected format
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
      // Neon Cycles / other formats - return raw Gemini response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

  } catch (error) {
    console.error('💥 Function Error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'AI service temporarily unavailable. Please try again in a moment.',
        details: error.message,
        retryable: true
      })
    };
  }
};