import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Try Groq first, fall back to Gemini
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!groqKey && !geminiKey) {
    return NextResponse.json({ error: 'No API key configured (GROQ_API_KEY or GEMINI_API_KEY)' }, { status: 500 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (groqKey) {
    return await callGroq(groqKey, requestBody);
  } else {
    // If we only have gemini key, we must use gemini
    return await callGemini(geminiKey as string, requestBody);
  }
}

// Groq API call (OpenAI-compatible format)
async function callGroq(apiKey: string, requestBody: any) {
  let messages: any[] = [];
  
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
    recentHistory.forEach((msg: any) => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    messages.push({ role: 'user', content: message });
  } else if (requestBody.contents) {
    // Gemini format - convert to OpenAI format
    const text = requestBody.contents[0]?.parts?.[0]?.text || '';
    messages.push({ role: 'user', content: text });
  } else {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
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
        return NextResponse.json({ 
          error: '⏳ AI is busy. Please wait a moment and try again.',
          retryable: true
        }, { status: 429 });
      }
      
      return NextResponse.json({ error: 'AI service error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    if (requestBody.message) {
      return NextResponse.json({ 
        response: responseText,
        source: 'groq-ai' 
      });
    } else {
      // Return in Gemini-compatible format for backward compatibility inside clients
      return NextResponse.json({
        candidates: [{
          content: {
            parts: [{ text: responseText }]
          }
        }]
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'AI service error. Please try again.',
      retryable: true
    }, { status: 500 });
  }
}

// Fallback to Gemini API
async function callGemini(apiKey: string, requestBody: any) {
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
    recentHistory.forEach((msg: any) => {
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
        return NextResponse.json({ 
          error: '⏳ AI is busy. Please wait 30 seconds and try again.',
          retryable: true
        }, { status: 429 });
      }
      
      return NextResponse.json({ error: 'AI service error', details: errorText }, { status: response.status });
    }

    const data = await response.json();

    if (requestBody.message && !requestBody.contents) {
      if (data.candidates?.[0]?.content?.parts?.[0]) {
        const responseText = data.candidates[0].content.parts[0].text;
        return NextResponse.json({ 
          response: responseText,
          source: 'gemini-ai' 
        });
      }
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'AI service error. Please try again.',
      retryable: true
    }, { status: 500 });
  }
}
