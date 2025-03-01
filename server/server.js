// server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get available models for debugging
    // console.log('Available models:', await genAI.listModels());

    // Initialize the Gemini model (updated to use gemini-1.5-pro if available)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // Try the newer model version
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Convert OpenAI format to Gemini format
    // For a single request rather than chat history
    const prompt = messages[messages.length - 1].content;
    
    // Include conversation history if there's more than one message
    let conversationContext = "solution of provided problem on diffrent coding platform";
    if (messages.length > 1) {
      conversationContext = messages.slice(0, -1).map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
      
      if (conversationContext) {
        conversationContext = "Previous conversation:\n\n" + conversationContext + "\n\n";
      }
    }

    // Generate content with the full context
    const fullPrompt = conversationContext + "User: " + prompt;
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // Format response to match OpenAI's format for frontend compatibility
    const response = {
      choices: [
        {
          message: {
            content: responseText
          }
        }
      ]
    };

    res.json(response);
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Detailed error information for debugging
    res.status(500).json({ 
      error: 'Error processing your request', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});