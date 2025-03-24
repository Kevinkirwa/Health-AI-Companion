import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getGeminiResponse } from "./api/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // AI Chatbot API
  app.post("/api/chat", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        // Allow chat for non-authenticated users, but don't save history
        const { message } = req.body;
        const response = await getGeminiResponse(message);
        return res.json({ response });
      }

      const { message } = req.body;
      const userId = req.user!.id;

      // Get response from Gemini AI
      const response = await getGeminiResponse(message);

      // Save to chat history if user is authenticated
      let chatHistory = await storage.getChatHistory(userId);
      const newMessage = {
        sender: 'user',
        text: message,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      const aiResponse = {
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      if (chatHistory) {
        // Update existing chat history
        const messages = [...chatHistory.messages, newMessage, aiResponse];
        await storage.updateChatHistory(chatHistory.id, messages);
      } else {
        // Create new chat history
        const messages = [
          {
            sender: 'ai',
            text: 'Hello! I\'m your AI Health Assistant. How can I help you today?',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          },
          newMessage,
          aiResponse
        ];
        await storage.createChatHistory({ userId, messages });
      }

      res.json({ response });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get chat history for a user
  app.get("/api/chat/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const chatHistory = await storage.getChatHistory(userId);
      
      if (!chatHistory) {
        // Return default welcome message if no history
        return res.json({
          messages: [
            {
              sender: 'ai',
              text: 'Hello! I\'m your AI Health Assistant. How can I help you today?',
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
          ]
        });
      }
      
      res.json({ messages: chatHistory.messages });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Hospital APIs
  app.get("/api/hospitals", async (req, res) => {
    try {
      const specialty = req.query.specialty as string;
      let hospitals;
      
      if (specialty && specialty !== 'all') {
        hospitals = await storage.getHospitalsBySpecialty(specialty);
      } else {
        hospitals = await storage.getAllHospitals();
      }
      
      res.json(hospitals);
    } catch (error) {
      console.error("Hospitals API error:", error);
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const hospitalId = parseInt(req.params.id);
      const hospital = await storage.getHospital(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error) {
      console.error("Hospital details API error:", error);
      res.status(500).json({ error: "Failed to fetch hospital details" });
    }
  });

  // Doctor APIs
  app.get("/api/doctors/hospital/:hospitalId", async (req, res) => {
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      const doctors = await storage.getDoctorsByHospital(hospitalId);
      res.json(doctors);
    } catch (error) {
      console.error("Doctors API error:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Appointment APIs
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const appointmentData = { ...req.body, userId };
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("User appointments error:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(appointmentId, status);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Appointment status update error:", error);
      res.status(500).json({ error: "Failed to update appointment status" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
