# 🔒 Content Security Policy (CSP) Setup Guide for Yikes AI Chatbot

## 🚨 Problem
The error `Failed to fetch. Refused to connect because it violates the document's Content Security Policy` occurs when your website's CSP blocks external API calls to Google's Gemini API.

## ✅ Solutions

### **Option 1: Add CSP Meta Tags (Recommended)**

Add this meta tag to the `<head>` section of your HTML files:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline';">
```

### **Option 2: Server-Level CSP Headers**

If you're using a web server, add these headers:

#### **Netlify (_headers file)**
```
/*
  Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
```

#### **Apache (.htaccess)**
```apache
Header always set Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
```

#### **Nginx**
```nginx
add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'";
```

### **Option 3: Netlify Functions (Advanced)**

Create a serverless function to proxy API calls:

**File: `netlify/functions/gemini-proxy.js`**
```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { message, apiKey } = JSON.parse(event.body);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

Then update the chatbot to use: `fetch('/.netlify/functions/gemini-proxy', ...)`

## 🛠️ Implementation Steps

### **For Existing Websites:**

1. **Add CSP Meta Tag**
   ```html
   <head>
     <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com;">
     <!-- other meta tags -->
   </head>
   ```

2. **Test the Connection**
   - Open browser developer tools (F12)
   - Check for CSP errors in Console
   - Test chatbot AI responses

3. **Verify API Key**
   - Ensure API key is properly stored in localStorage
   - Use the production setup page to test

### **For Netlify Deployment:**

1. **Create `_headers` file in your root directory:**
   ```
   /*
     Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com
   ```

2. **Or add CSP to `netlify.toml`:**
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       Content-Security-Policy = "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com"
   ```

## 🔍 Testing Your Setup

### **1. Browser Console Test**
```javascript
// Test in browser console
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello' }] }]
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### **2. CSP Validator**
Use online CSP validators to check your policy:
- https://csp-evaluator.withgoogle.com/
- https://report-uri.com/home/analyse

## 📋 CSP Directive Breakdown

| Directive | Purpose | Value |
|-----------|---------|-------|
| `default-src` | Default policy for all resources | `'self' 'unsafe-inline' 'unsafe-eval'` |
| `connect-src` | Controls fetch/XHR requests | `'self' https://generativelanguage.googleapis.com` |
| `script-src` | Controls JavaScript execution | `'self' 'unsafe-inline' 'unsafe-eval'` |
| `style-src` | Controls CSS loading | `'self' 'unsafe-inline'` |

## 🔧 Troubleshooting

### **Common Issues:**

1. **"unsafe-inline" needed but blocked**
   - Add `'unsafe-inline'` to script-src and style-src

2. **Google Analytics blocked**
   - Add `https://www.googletagmanager.com` to connect-src

3. **CDN resources blocked**
   - Add your CDN domains to appropriate directives

### **Debug Steps:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for CSP violation errors
4. Add the blocked domains to your CSP policy

## 🚀 Quick Fix for Testing

For immediate testing, add this to your HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';">
```

⚠️ **Warning:** This is very permissive and should only be used for testing!

## 📞 Support

If you're still having issues:

1. Check browser console for specific CSP errors
2. Verify your API key is valid
3. Test the connection using the production setup page
4. Ensure you're using the latest version of the chatbot widget

## 🔒 Security Best Practices

1. **Use specific domains** instead of wildcards (*)
2. **Avoid 'unsafe-eval'** if possible
3. **Regularly review** your CSP policy
4. **Test thoroughly** after CSP changes
5. **Monitor CSP violations** in production 