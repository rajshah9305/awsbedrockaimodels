/**
 * AWS Bedrock API Routes
 * 
 * @author RAJ SHAH
 * @description API endpoints for AWS Bedrock operations
 */

const express = require('express');
const router = express.Router();
const bedrockService = require('../services/bedrockService');

// List available models
router.get('/models', async (req, res) => {
  try {
    const models = await bedrockService.listAvailableModels();
    res.json({ success: true, models });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Text generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, modelId, parameters } = req.body;
    
    if (!prompt || !modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt and modelId are required' 
      });
    }

    const response = await bedrockService.generateText(prompt, modelId, parameters);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Streaming text generation endpoint
router.post('/generate-stream', async (req, res) => {
  try {
    const { prompt, modelId, parameters } = req.body;
    
    if (!prompt || !modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt and modelId are required' 
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await bedrockService.generateTextStream(prompt, modelId, parameters, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error streaming text:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Chat conversation endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages, modelId, parameters } = req.body;
    
    if (!messages || !modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Messages and modelId are required' 
      });
    }

    const response = await bedrockService.chat(messages, modelId, parameters);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Image generation endpoint
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, modelId, parameters } = req.body;
    
    if (!prompt || !modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt and modelId are required' 
      });
    }

    const response = await bedrockService.generateImage(prompt, modelId, parameters);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Embeddings endpoint
router.post('/embeddings', async (req, res) => {
  try {
    const { text, modelId } = req.body;
    
    if (!text || !modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text and modelId are required' 
      });
    }

    const response = await bedrockService.generateEmbeddings(text, modelId);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
