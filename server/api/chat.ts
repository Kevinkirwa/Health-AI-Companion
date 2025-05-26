import { Express, Request, Response } from "express";
import { IStorage } from "../storage";
import { z } from "zod";
import { insertChatMessageSchema, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { MongoStorage } from "../storage/mongodb";
import { getGeminiResponse } from "../services/gemini";

// Create storage instance
const storage = new MongoStorage();

// API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "mock-api-key";

// Mock function to simulate Gemini AI API calls
// In a real implementation, this would use the actual Gemini AI API
async function getGeminiResponse(message: string, history?: { role: string; content: string }[]): Promise<string> {
  // For health-related queries, create appropriate AI responses
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes("headache") || lowercaseMessage.includes("migraine")) {
    return "I understand you're experiencing headaches. This could be due to various factors such as stress, dehydration, or eye strain. I'd like to learn more about your symptoms to provide better guidance. How long have you been experiencing these headaches? Are they accompanied by any other symptoms like nausea or sensitivity to light? Have you tried any remedies so far?";
  }
  
  if (lowercaseMessage.includes("fever") || lowercaseMessage.includes("temperature")) {
    return "Fever is often a sign that your body is fighting an infection. For adults, a temperature above 100.4°F (38°C) is generally considered a fever. I recommend:\n- Rest and stay hydrated\n- Take acetaminophen or ibuprofen if appropriate\n- Use a lukewarm compress if the fever is uncomfortable\n- Seek medical attention if your fever is above 103°F (39.4°C), lasts more than three days, or is accompanied by severe symptoms";
  }
  
  if (lowercaseMessage.includes("anxiety") || lowercaseMessage.includes("stress") || lowercaseMessage.includes("nervous")) {
    return "I'm sorry to hear you're feeling anxious. Anxiety is a common experience that can be managed with various techniques:\n- Practice deep breathing exercises (4-7-8 method)\n- Try mindfulness meditation\n- Ensure you're getting enough sleep and exercise\n- Consider talking to a therapist or counselor for professional support\n- Limit caffeine and alcohol which can worsen anxiety\n\nWould you like me to explain any of these techniques in more detail?";
  }
  
  if (lowercaseMessage.includes("cut") || lowercaseMessage.includes("bleeding")) {
    return "For a minor cut or wound that's bleeding:\n- Wash your hands to prevent infection\n- Apply gentle pressure with a clean cloth or bandage until bleeding stops\n- Clean the wound with mild soap and water\n- Apply antibiotic ointment if available\n- Cover with a sterile bandage\n\nSeek medical attention if:\n- The bleeding doesn't stop after 15 minutes of pressure\n- The cut is deep or has jagged edges\n- There's debris in the wound you can't remove\n- The wound is from a rusty object or animal bite";
  }
  
  // Default response for other health queries
  return "Thanks for your health question. To provide the most helpful guidance, I'd need some more specific details about your symptoms or concern. Could you please provide more information about what you're experiencing, when it started, and any other relevant details? This will help me give you more accurate information.";
}

// Setup chat routes
export function setupChatRoutes(app: Express): void {
  // Message validation schema
  const chatMessageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty"),
    history: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })).optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional()
  });

  // Get chat history
  app.get("/api/chat/history", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const messages = await storage.getChatMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });
  
  // Send a new message
  app.post("/api/chat/message", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = chatMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }
      
      const { message } = result.data;
      
      // Ensure user is authenticated
      const userId = req.isAuthenticated() ? req.user.id : "0";
      
      // Store user message
      const userMessage: InsertChatMessage = {
        userId,
        role: "user",
        content: message
      };
      
      await storage.createChatMessage(userMessage);
      
      // Get history if authenticated user
      let history: ChatMessage[] = [];
      if (userId !== "0") {
        history = await storage.getChatMessages(userId);
      }
      
      // Convert history to the format expected by Gemini
      const formattedHistory = history
        .slice(-10) // Only use last 10 messages for context
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Add system prompt for health context
      const systemPrompt = `You are a helpful and empathetic AI assistant with expertise in health and medicine. Your role is to:
1. Answer any question the user asks, with a focus on health and medical topics
2. Provide accurate, evidence-based information
3. Be conversational and engaging while maintaining professionalism
4. Admit when you're not sure about something
5. Provide context and explanations for medical terms
6. Include relevant statistics and research when appropriate
7. Suggest reliable sources for further reading
8. Know when to recommend professional medical help

For health-related questions:
- Provide detailed, accurate information
- Include practical advice and tips
- Explain medical concepts in simple terms
- Mention potential risks and precautions
- Suggest when to seek professional help

For non-health questions:
- Answer directly and informatively
- Maintain a helpful and friendly tone
- Provide relevant examples or analogies
- Ask clarifying questions if needed

Remember to:
- Be thorough but concise
- Use clear, accessible language
- Stay up-to-date with current medical knowledge
- Prioritize user safety and well-being
- Maintain appropriate boundaries`;

      // Get AI response from Gemini with system prompt
      const aiResponse = await getGeminiResponse(
        `${systemPrompt}\n\nUser: ${message}`,
        formattedHistory
      );
      
      // Store AI response
      const assistantMessage: InsertChatMessage = {
        userId,
        role: "assistant",
        content: aiResponse
      };
      
      await storage.createChatMessage(assistantMessage);
      
      // Return the AI response
      res.json({ message: aiResponse, success: true });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message", success: false });
    }
  });
  
  // Analyze symptoms endpoint
  app.post("/api/chat/analyze-symptoms", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Symptoms description is required", success: false });
      }
      
      // Get an AI response specifically tailored for symptom analysis
      const response = await getGeminiResponse(`Analyze these symptoms medically: ${message}`);
      
      res.json({ message: response, success: true });
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      res.status(500).json({ message: "Failed to analyze symptoms", success: false });
    }
  });
  
  // First aid guidance endpoint
  app.post("/api/chat/first-aid", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Emergency situation description is required", success: false });
      }
      
      // Get an AI response specifically tailored for first aid guidance
      const response = await getGeminiResponse(`Provide detailed first aid instructions for this situation: ${message}`);
      
      res.json({ message: response, success: true });
    } catch (error) {
      console.error("Error providing first aid guidance:", error);
      res.status(500).json({ message: "Failed to provide first aid guidance", success: false });
    }
  });
  
  // Mental health support endpoint
  app.post("/api/chat/mental-health", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Mental health concern description is required", success: false });
      }
      
      // Get an AI response specifically tailored for mental health support
      const response = await getGeminiResponse(`Provide compassionate mental health support for: ${message}`);
      
      res.json({ message: response, success: true });
    } catch (error) {
      console.error("Error providing mental health support:", error);
      res.status(500).json({ message: "Failed to provide mental health support", success: false });
    }
  });
  
  // Get first aid tips
  app.get("/api/first-aid", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      
      let tips;
      if (category) {
        tips = await storage.getFirstAidTipsByCategory(category as string);
      } else {
        tips = await storage.getAllFirstAidTips();
      }
      
      res.json(tips);
    } catch (error) {
      console.error("Error fetching first aid tips:", error);
      res.status(500).json({ message: "Failed to fetch first aid tips" });
    }
  });
  
  // Get mental health resources
  app.get("/api/mental-health", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      
      let resources;
      if (category) {
        resources = await storage.getMentalHealthResourcesByCategory(category as string);
      } else {
        resources = await storage.getAllMentalHealthResources();
      }
      
      res.json(resources);
    } catch (error) {
      console.error("Error fetching mental health resources:", error);
      res.status(500).json({ message: "Failed to fetch mental health resources" });
    }
  });
}
