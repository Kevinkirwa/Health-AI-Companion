const express = require('express');

function setupChatRoutes(app, storage) {
  const router = express.Router();

  // Get chat history
  router.get('/history', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const messages = await storage.getChatMessages(req.user.id);
      res.json({ messages });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: 'Error getting chat history' });
    }
  });

  // Send message
  router.post('/send', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { message, type = 'text' } = req.body;
      const chatMessage = await storage.createChatMessage({
        userId: req.user.id,
        message,
        type,
        timestamp: new Date()
      });

      res.json({
        message: 'Message sent successfully',
        chatMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  });

  // Get AI response
  router.post('/ai-response', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { message } = req.body;
      
      // Here you would integrate with your AI service
      // For now, we'll just echo back a simple response
      const aiResponse = {
        message: `I received your message: "${message}". This is a placeholder response.`,
        timestamp: new Date()
      };

      // Save the AI response
      const chatMessage = await storage.createChatMessage({
        userId: req.user.id,
        message: aiResponse.message,
        type: 'ai',
        timestamp: aiResponse.timestamp
      });

      res.json({
        message: 'AI response received',
        chatMessage
      });
    } catch (error) {
      console.error('AI response error:', error);
      res.status(500).json({ message: 'Error getting AI response' });
    }
  });

  // Clear chat history
  router.delete('/clear', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      await storage.clearChatHistory(req.user.id);
      res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({ message: 'Error clearing chat history' });
    }
  });

  app.use('/api/chat', router);
}

module.exports = { setupChatRoutes }; 