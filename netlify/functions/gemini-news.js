// Gemini function specialized for News Sentiment page
// Separate from cap-table assistant to keep prompts independent

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const userMessage = body.message || '';
  const systemPreamble = body.systemPrompt || `
You are a financial news sentiment assistant.
You receive a short user request and a compact JSON context containing: the search query, time window, overall sentiment counts, and a short list of top articles (title, source, sentiment, combinedScore).

Objectives:
- Provide clear, neutral, concise insights for non-experts.
- Use bullet points by default; 4-8 bullets is ideal.
- Reference themes and sources at a high level; do not fabricate details.
- Do not give investment advice; avoid directives like “buy/sell/hold”.
- If context is missing, state assumptions briefly.
`;

  const { default: fetch } = await import('node-fetch');

  const prompt = `${systemPreamble}\n\nUser request:\n${userMessage}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, topK: 40, topP: 0.9, maxOutputTokens: 700 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Gemini API error', details: errText }) };
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { statusCode: 200, headers, body: JSON.stringify({ response: responseText }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error', details: e.message }) };
  }
};

