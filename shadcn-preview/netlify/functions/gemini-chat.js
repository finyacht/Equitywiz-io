// AI Chat function - Now using Groq API (much faster, better rate limits)
// Supports both GROQ_API_KEY and GEMINI_API_KEY for backward compatibility

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

  // Try Groq first, fall back to Gemini
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!groqKey && !geminiKey) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'No API key configured (GROQ_API_KEY or GEMINI_API_KEY)' })
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

  // Use Groq if available (preferred - faster and better rate limits)
  if (groqKey) {
    return await callGroq(groqKey, requestBody, headers);
  } else {
    return await callGemini(geminiKey, requestBody, headers);
  }
};

// Groq API call (OpenAI-compatible format)
async function callGroq(apiKey, requestBody, headers) {
  let messages = [];
  
  const systemPrompt = `You are Yikes AI, a specialized assistant for equity and cap table management.

**YOUR KNOWLEDGE SOURCE:**
- Cap Table & Compliance Management
- Stakeholder Management & Participant Portals
- Share Transactions & Equity Grant Administration
- Vesting Schedules & Plan Management
- Option Exercise & Release Processes
- Round Modeling & Convertible Instruments

**RESPONSE FORMAT:**
Use bullet points and be comprehensive. End with a practical tip.`;

  if (requestBody.message) {
    // Chatbot format
    const { message, history = [] } = requestBody;
    
    messages.push({ role: 'system', content: systemPrompt });
    
    // Add conversation history
    const recentHistory = history.slice(-4);
    recentHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    messages.push({ role: 'user', content: message });
  } else if (requestBody.contents) {
    // Gemini format - convert to OpenAI format
    const text = requestBody.contents[0]?.parts?.[0]?.text || '';
    messages.push({ role: 'user', content: text });
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request format' })
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: '⏳ AI is busy. Please wait a moment and try again.',
            retryable: true
          })
        };
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'AI service error', details: errorText })
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    // Return in format expected by chatbot
    if (requestBody.message) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: responseText,
          source: 'groq-ai' 
        })
      };
    } else {
      // Return in Gemini-compatible format for other pages
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: responseText }]
            }
          }]
        })
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
}

// Fallback to Gemini API
async function callGemini(apiKey, requestBody, headers) {
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
      
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: '⏳ AI is busy. Please wait 30 seconds and try again.',
            retryable: true
          })
        };
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'AI service error', details: errorText })
      };
    }

    const data = await response.json();

    if (requestBody.message && !requestBody.contents) {
      if (data.candidates?.[0]?.content?.parts?.[0]) {
        const responseText = data.candidates[0].content.parts[0].text;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            response: responseText,
            source: 'gemini-ai' 
          })
        };
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

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
}
