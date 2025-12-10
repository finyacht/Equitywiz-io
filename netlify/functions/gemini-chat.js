// Simplified - no retries to avoid Netlify timeout (10s limit)
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
    
    const recentHistory = history.slice(-4);
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
        maxOutputTokens: 800
      }
    };
  } else {
    geminiRequestBody = requestBody;
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let userMessage = errorText;
      
      if (response.status === 429) {
        userMessage = '⏳ AI is busy. Please wait 30 seconds and try again.';
      } else if (response.status === 403) {
        userMessage = 'API key issue. Please check configuration.';
      } else if (response.status === 400) {
        userMessage = 'Invalid request. Try a simpler query.';
      }
      
      return { 
        statusCode: response.status, 
        headers,
        body: JSON.stringify({ 
          error: userMessage,
          status: response.status,
          retryable: response.status === 429
        })
      };
    }

    const data = await response.json();

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
        throw new Error('Invalid response from Gemini');
      }
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'AI service error. Please try again.',
        retryable: true
      })
    };
  }
};
