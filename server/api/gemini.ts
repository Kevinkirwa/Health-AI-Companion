import { createClient } from '@google/generative-ai';

// Initialize the Gemini API client
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = createClient(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Health context to add to the prompt
const HEALTH_CONTEXT = `
You are an AI Health Assistant. Your role is to provide helpful, accurate health information and guidance.
Always clarify that you're not a doctor and your advice is not a substitute for professional medical help.
For emergencies, always recommend calling emergency services.
Keep responses concise, informative, and focused on evidence-based medicine.
For serious symptoms, suggest consulting with a healthcare professional.
`;

export async function getGeminiResponse(userQuery: string): Promise<string> {
  try {
    if (!API_KEY) {
      return "I'm unable to process your request at the moment. API configuration is missing. Please try again later.";
    }

    const prompt = `${HEALTH_CONTEXT}\n\nUser query: ${userQuery}`;
    
    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I'm experiencing some difficulties processing your request. Please try again later.";
  }
}
