const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../auth');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'PARAKH AI assistant is temporarily unavailable (missing API configuration).' });
    }
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required.' });
    }

    // Format messages for the API (only keep role and content)
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are PARAKH AI, a professional cyber forensic and digital trust assistant. You help investigators verify claims, analyze scams (like phishing, job scams, voice cloning, fake certificates, typosquatting), and explain threat indicators. Answer questions clearly, accurately, and contextually. Keep your answers concise, professional, and directly helpful.'
        },
        ...formattedMessages
      ],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiMessage = response.data.choices[0].message;
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Error calling Groq API:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to communicate with PARAKH AI.',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
