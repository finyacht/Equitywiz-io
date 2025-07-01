# 🔧 Environment Variable Fix

## ❌ Current Issue
Your environment variable is set incorrectly:
- **Key**: `AIzaSyB4ix_spZPsxIw_A3T6X0y6dc33fCmkvqk` (this is wrong)
- **Value**: `••••••` 

## ✅ Correct Setup
The environment variable should be:
- **Key**: `GEMINI_API_KEY`
- **Value**: `AIzaSyB4ix_spZPsxIw_A3T6X0y6dc33fCmkvqk`

## 📋 Steps to Fix

1. **Go to Netlify Dashboard**
   - Site Settings → Environment Variables

2. **Delete the Wrong Variable**
   - Find the variable named `AIzaSyB4ix_spZPsxIw_A3T6X0y6dc33fCmkvqk`
   - Click "..." → Delete

3. **Add the Correct Variable**
   - Click "Add a variable"
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyB4ix_spZPsxIw_A3T6X0y6dc33fCmkvqk`
   - **Scopes**: ✓ Production, ✓ Deploy previews

4. **Redeploy Your Site**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## 🧪 After Fixing
Once corrected, your chatbot should:
- Show "AI Mode Active" in the header
- Respond with AI-powered answers
- No longer fall back to knowledge base

## 🔍 How to Verify
1. Open browser console (F12)
2. Try sending a message in chatbot
3. Look for successful function calls in Network tab
4. Should see `/.netlify/functions/gemini-chat` with 200 status

---
**The key (literally!) is that the environment variable NAME should be `GEMINI_API_KEY`, not the API key value itself.** 