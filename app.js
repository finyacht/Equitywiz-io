const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Try to use built-in fetch (Node 18+) or fallback to node-fetch
let fetch;
try {
  fetch = globalThis.fetch;
} catch {
  fetch = require('node-fetch');
}

const app = express();
const port = 3000; // Changed from 4000 to 3000

// Add middleware to parse JSON bodies
app.use(express.json());

// First handle specific routes before serving static files
// Route for the root path (Home page) - always serve home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for the Waterfall Analysis Tool - both with and without .html extension
app.get('/waterfall', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/waterfall.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// The index.html file is the Waterfall Analysis Tool
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the Netflix Option Modeler - both with and without .html extension
app.get('/netflix', (req, res) => {
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

app.get('/netflix.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'netflix.html'));
});

// Route for accessing the home page directly
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for the Vanilla Option Modeler
app.get('/vanilla', (req, res) => {
  res.sendFile(path.join(__dirname, 'vanilla.html'));
});

app.get('/vanilla.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'vanilla.html'));
});

// Route for the Interest Rate Calculator
app.get('/interest-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'interest-calculator.html'));
});

app.get('/interest-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'interest-calculator.html'));
});

// Route for the Budget & Finances Modeler
app.get('/budget-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'budget-calculator.html'));
});

app.get('/budget-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'budget-calculator.html'));
});

// Route for the Grant Calculator
app.get('/grant-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'grant-calculator.html'));
});

app.get('/grant-calculator.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'grant-calculator.html'));
});

// Route for the Chatbot Demo
app.get('/chatbot-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot-demo.html'));
});

app.get('/chatbot-demo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot-demo.html'));
});

// Route for the Neon Cycles Game
app.get('/neon-cycles', (req, res) => {
  res.sendFile(path.join(__dirname, 'neon-cycles.html'));
});

app.get('/neon-cycles.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'neon-cycles.html'));
});

// Gemini API Proxy Route
app.post('/api/gemini-chat', async (req, res) => {
  try {
    const { message, history, apiKey } = req.body;
    
    // Use provided API key or fall back to environment variable
    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!activeApiKey) {
      return res.status(400).json({ error: 'API key not available' });
    }

    console.log('🤖 Gemini Proxy: Received request with message:', message);
    console.log('🔑 Gemini Proxy: API Key present:', !!activeApiKey);
    console.log('🌍 Gemini Proxy: Using environment key:', !apiKey && !!process.env.GEMINI_API_KEY);

    // Build conversation for Gemini (simplified format)
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
    
    // Add conversation history (last 6 messages)
    const recentHistory = (history || []).slice(-6);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    });
    
    // Add current message
    conversationText += `User: ${message}\nAssistant:`;
    
    const contents = [{
      parts: [{
        text: conversationText
      }]
    }];

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    console.log('📤 Gemini Proxy: Sending request to Gemini API');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Gemini Proxy: Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Gemini Proxy: Success');
      
      // Transform Gemini response to match expected format
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const transformedResponse = {
          candidates: [{
            content: {
              parts: [{ text: data.candidates[0].content.parts[0].text }]
            }
          }]
        };
        res.json(transformedResponse);
      } else {
        console.error('❌ Gemini Proxy: Invalid response format:', data);
        res.status(500).json({ error: 'Invalid response format from Gemini API' });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Gemini Proxy: API Error:', errorText);
      res.status(response.status).json({ error: errorText });
    }
  } catch (error) {
    console.error('💥 Gemini Proxy: Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the current directory
// This comes AFTER route definitions to prevent conflicts
app.use(express.static(__dirname));

// Custom 404 handler
app.use((req, res) => {
  // Don't redirect tool routes
  if (req.path.includes('calculator') || req.path.includes('modeler')) {
    res.sendFile(path.join(__dirname, req.path + '.html'));
  } else {
    res.redirect('/home');
  }
});

// Start the server listening on all interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Financial Modeling Tools running at http://localhost:${port}`);
  console.log(`You can also try http://127.0.0.1:${port}`);
  
  // Try to open the browser window automatically
  try {
    console.log('Attempting to open browser window...');
    // For Windows
    exec(`start http://localhost:${port}/budget-calculator`);
  } catch (err) {
    console.error('Failed to open browser window:', err);
  }
}).on('error', (err) => {
  console.error('Error starting server:', err);
}); 