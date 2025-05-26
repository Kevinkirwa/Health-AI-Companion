const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function initializeAIRoutes() {
  const router = express.Router();

  // Chat with AI
  router.post('/chat', async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create chat session
      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.role,
          parts: msg.content
        }))
      });

      // Send message and get response
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      res.json({
        message: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: 'Error processing AI chat request' });
    }
  });

  // Get health advice
  router.post('/health-advice', async (req, res) => {
    try {
      const { symptoms, medicalHistory } = req.body;

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create prompt
      const prompt = `Based on the following symptoms and medical history, provide health advice:
        Symptoms: ${symptoms.join(', ')}
        Medical History: ${medicalHistory.join(', ')}
        Please provide general advice and recommendations.`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        advice: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Health advice error:', error);
      res.status(500).json({ message: 'Error getting health advice' });
    }
  });

  // Get emergency guidance
  router.post('/emergency-guidance', async (req, res) => {
    try {
      const { emergencyType, location } = req.body;

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create prompt
      const prompt = `Emergency Type: ${emergencyType}
        Location: ${location}
        Please provide immediate first aid guidance and emergency response steps.`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        guidance: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Emergency guidance error:', error);
      res.status(500).json({ message: 'Error getting emergency guidance' });
    }
  });

  // Get medication information
  router.post('/medication-info', async (req, res) => {
    try {
      const { medicationName } = req.body;

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create prompt
      const prompt = `Please provide information about the medication: ${medicationName}
        Include:
        1. Common uses
        2. Dosage information
        3. Side effects
        4. Precautions
        5. Drug interactions`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        information: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Medication info error:', error);
      res.status(500).json({ message: 'Error getting medication information' });
    }
  });

  // Get wellness tips
  router.get('/wellness-tips', async (req, res) => {
    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create prompt
      const prompt = `Please provide 5 general wellness tips for maintaining good health.
        Include tips about:
        1. Physical health
        2. Mental health
        3. Nutrition
        4. Exercise
        5. Sleep`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        tips: text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Wellness tips error:', error);
      res.status(500).json({ message: 'Error getting wellness tips' });
    }
  });

  return router;
}

module.exports = { initializeAIRoutes }; 