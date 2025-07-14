const https = require('https');

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
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody)
      }
    );

    console.log('📥 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', errorText);
      return { 
        statusCode: response.status, 
        headers,
        body: JSON.stringify({ error: `Gemini API error: ${errorText}` })
      };
    }

    const data = await response.json();
    console.log('✅ Gemini API Success');

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
        error: 'Internal server error', 
        details: error.message 
      })
    };
  }
}; 