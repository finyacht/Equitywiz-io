// AI function for News Sentiment page - Now using Groq API
// Supports both GROQ_API_KEY and GEMINI_API_KEY for backward compatibility

exports.handler = async function(event) {
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Try Groq first, fall back to Gemini
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!groqKey && !geminiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No API key configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const userMessage = body.message || '';
  const systemPrompt = body.systemPrompt || `You are a financial news sentiment assistant.
Provide clear, neutral, concise insights. Use bullet points (4-8 bullets).
Do not give investment advice.`;

  // Use Groq if available (preferred)
  if (groqKey) {
    return await callGroq(groqKey, systemPrompt, userMessage, headers);
  } else {
    return await callGemini(geminiKey, systemPrompt, userMessage, headers);
  }
};

// Groq API call
async function callGroq(apiKey, systemPrompt, userMessage, headers) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.6,
        max_tokens: 700
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      
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
      
      return { statusCode: response.status, headers, body: JSON.stringify({ error: 'AI error', details: errText }) };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, headers, body: JSON.stringify({ response: responseText }) };
    
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service error', details: e.message }) };
  }
}

// Fallback to Gemini API
async function callGemini(apiKey, systemPrompt, userMessage, headers) {
  const prompt = `${systemPrompt}\n\nUser request:\n${userMessage}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, topK: 40, topP: 0.9, maxOutputTokens: 500 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      
      if (res.status === 429) {
        return { 
          statusCode: 429, 
          headers, 
          body: JSON.stringify({ 
            error: '⏳ AI is busy. Please wait 30 seconds and try again.',
            retryable: true 
          }) 
        };
      }
      
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Gemini error', details: errText }) };
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { statusCode: 200, headers, body: JSON.stringify({ response: responseText }) };
    
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service error', details: e.message }) };
  }
}
