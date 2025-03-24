import { apiRequest } from "./queryClient";

/**
 * Interface for Gemini API request configurations
 */
interface GeminiRequestConfig {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Interface for Gemini API response
 */
interface GeminiResponse {
  message: string;
  success: boolean;
}

/**
 * Class to handle interactions with the Gemini AI API through our backend
 */
export class GeminiAI {
  /**
   * Generate a response from Gemini AI for health-related queries
   * 
   * @param message - The user's message to send to Gemini
   * @param history - Optional chat history for context
   * @returns A Promise containing the AI response
   */
  static async generateHealthResponse(
    message: string,
    history?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<GeminiResponse> {
    try {
      const config: GeminiRequestConfig = {
        message,
        history,
        temperature: 0.7, // Balanced between creative and factual
        maxTokens: 1024,  // Reasonable length for health responses
      };

      const response = await apiRequest("POST", "/api/chat/message", config);
      const data = await response.json();
      
      return {
        message: data.message,
        success: true
      };
    } catch (error) {
      console.error("Error generating Gemini AI response:", error);
      return {
        message: "I'm sorry, but I couldn't process your request. Please try again later.",
        success: false
      };
    }
  }

  /**
   * Analyze symptoms using Gemini AI
   * 
   * @param symptoms - Description of symptoms
   * @returns Possible conditions and recommendations
   */
  static async analyzeSymptoms(symptoms: string): Promise<GeminiResponse> {
    try {
      const config: GeminiRequestConfig = {
        message: `Analyze these symptoms: ${symptoms}`,
        temperature: 0.3, // More factual for medical analysis
      };

      const response = await apiRequest("POST", "/api/chat/analyze-symptoms", config);
      const data = await response.json();
      
      return {
        message: data.message,
        success: true
      };
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      return {
        message: "I couldn't analyze your symptoms at this time. Please try again later or consult a healthcare professional directly.",
        success: false
      };
    }
  }

  /**
   * Get first aid instructions using Gemini AI
   * 
   * @param situation - Description of the emergency situation
   * @returns First aid instructions
   */
  static async getFirstAidInstructions(situation: string): Promise<GeminiResponse> {
    try {
      const config: GeminiRequestConfig = {
        message: `Provide first aid instructions for: ${situation}`,
        temperature: 0.2, // Very factual for critical medical information
      };

      const response = await apiRequest("POST", "/api/chat/first-aid", config);
      const data = await response.json();
      
      return {
        message: data.message,
        success: true
      };
    } catch (error) {
      console.error("Error getting first aid instructions:", error);
      return {
        message: "I couldn't provide first aid instructions at this time. Please call emergency services if this is urgent.",
        success: false
      };
    }
  }

  /**
   * Get mental health support using Gemini AI
   * 
   * @param query - User's mental health concern or question
   * @returns Supportive response with resources
   */
  static async getMentalHealthSupport(query: string): Promise<GeminiResponse> {
    try {
      const config: GeminiRequestConfig = {
        message: `Provide mental health support for: ${query}`,
        temperature: 0.8, // More empathetic for mental health support
      };

      const response = await apiRequest("POST", "/api/chat/mental-health", config);
      const data = await response.json();
      
      return {
        message: data.message,
        success: true
      };
    } catch (error) {
      console.error("Error getting mental health support:", error);
      return {
        message: "I couldn't provide mental health support at this time. If you're in crisis, please contact a mental health hotline or professional.",
        success: false
      };
    }
  }
}

export default GeminiAI;
