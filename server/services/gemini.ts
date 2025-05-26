import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getGeminiResponse(message: string, history: { role: string; content: string }[] = []) {
  try {
    // Format the chat history for Gemini
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: msg.content,
      })),
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    // Send the message and get the response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Format the response to be more conversational
    let formattedResponse = response.text();
    
    // Add follow-up questions if the response is too short
    if (formattedResponse.length < 200 && !formattedResponse.includes("?")) {
      formattedResponse += "\n\nTo help you better, could you please provide more details about:\n" +
        "1. What specific aspects would you like to know more about?\n" +
        "2. Are there any particular concerns you have?\n" +
        "3. Would you like me to explain any part in more detail?";
    }

    // Add medical disclaimer for health-related responses
    if (message.toLowerCase().includes("health") || 
        message.toLowerCase().includes("medical") ||
        message.toLowerCase().includes("symptom") ||
        message.toLowerCase().includes("disease") ||
        message.toLowerCase().includes("treatment") ||
        message.toLowerCase().includes("diagnosis")) {
      formattedResponse = "ℹ️ Note: While I can provide general information, always consult with healthcare professionals for medical advice and treatment.\n\n" + formattedResponse;
    }
    
    return formattedResponse;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    throw new Error("Failed to get response from AI");
  }
} 