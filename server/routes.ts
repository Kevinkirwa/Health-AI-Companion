import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupChatRoutes } from "./api/chat";
import { setupHospitalRoutes } from "./api/hospitals";
import { setupBookingRoutes } from "./api/bookings";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Setup API routes
  setupChatRoutes(app);
  setupHospitalRoutes(app);
  setupBookingRoutes(app);

  // Sample route to test if API is working
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok", message: "AI Health Assistant API is running" });
  });

  // Admin-only route for user management
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
