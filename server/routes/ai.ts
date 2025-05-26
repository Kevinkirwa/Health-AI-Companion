import { Router } from 'express';
import { AIService } from '../services/AIService';

const router = Router();

// Health chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await AIService.generateHealthResponse(message, context);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Symptom analysis endpoint
router.post('/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }

    const analysis = await AIService.analyzeSymptoms(symptoms);
    res.json({ analysis });
  } catch (error) {
    console.error('Error in symptom analysis:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

// Health tips endpoint
router.get('/health-tips', async (req, res) => {
  try {
    const { category } = req.query;
    const tips = await AIService.getHealthTips(category as string);
    res.json({ tips });
  } catch (error) {
    console.error('Error getting health tips:', error);
    res.status(500).json({ error: 'Failed to get health tips' });
  }
});

// Medication information endpoint
router.get('/medication-info/:medication', async (req, res) => {
  try {
    const { medication } = req.params;
    if (!medication) {
      return res.status(400).json({ error: 'Medication name is required' });
    }

    const info = await AIService.getMedicationInfo(medication);
    res.json({ info });
  } catch (error) {
    console.error('Error getting medication info:', error);
    res.status(500).json({ error: 'Failed to get medication information' });
  }
});

export function initializeAIRoutes() {
  try {
    AIService.initialize();
    return router;
  } catch (error) {
    console.error('Failed to initialize AI routes:', error);
    throw error;
  }
} 