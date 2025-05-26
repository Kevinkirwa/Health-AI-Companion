import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private static genAI: GoogleGenerativeAI;
  private static model: any;

  static initialize() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  static async generateHealthResponse(userInput: string, context?: any) {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      // Create a prompt that includes health context and safety guidelines
      const prompt = `
        You are a Health AI Assistant powered by Gemini AI. Your role is to provide helpful, 
        accurate, and safe health-related information. Remember:
        - Always prioritize user safety
        - Provide general health information only
        - Encourage professional medical consultation for specific conditions
        - Be clear about limitations
        - Use simple, understandable language

        User Input: ${userInput}
        ${context ? `Context: ${JSON.stringify(context)}` : ''}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  static async analyzeSymptoms(symptoms: string[]) {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      const prompt = `
        Analyze these symptoms and provide general guidance:
        ${symptoms.join(', ')}

        Remember:
        - This is not a diagnosis
        - Suggest when to seek medical attention
        - Provide general wellness advice
        - List potential common conditions
        - Emphasize the importance of professional medical consultation
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  }

  static async getHealthTips(category?: string) {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      const prompt = `
        Provide general health and wellness tips${category ? ` for ${category}` : ''}.
        Focus on:
        - Preventive care
        - Healthy lifestyle habits
        - General wellness practices
        - Evidence-based recommendations
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating health tips:', error);
      throw error;
    }
  }

  static async getMedicationInfo(medication: string) {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      const prompt = `
        Provide general information about ${medication}:
        - Common uses
        - General precautions
        - Typical side effects
        - Important warnings
        - When to consult a healthcare provider

        Remember to emphasize:
        - This is general information only
        - Always follow healthcare provider's instructions
        - Consult healthcare provider for specific advice
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting medication info:', error);
      throw error;
    }
  }
} 