import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertHospitalSchema, insertDoctorSchema } from "@shared/schema";

// Setup hospital routes
export function setupHospitalRoutes(app: Express): void {
  // Get all hospitals
  app.get("/api/hospitals", async (req: Request, res: Response) => {
    try {
      const { location, specialty } = req.query;
      
      const hospitals = await storage.getHospitalsByFilters({
        location: location as string,
        specialty: specialty as string
      });
      
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      res.status(500).json({ message: "Failed to fetch hospitals" });
    }
  });
  
  // Get all hospitals (admin only)
  app.get("/api/hospitals/all", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const hospitals = await storage.getAllHospitals();
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching all hospitals:", error);
      res.status(500).json({ message: "Failed to fetch hospitals" });
    }
  });
  
  // Get saved hospitals for the authenticated user
  app.get("/api/hospitals/saved", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const hospitals = await storage.getSavedHospitals(req.user.id);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching saved hospitals:", error);
      res.status(500).json({ message: "Failed to fetch saved hospitals" });
    }
  });
  
  // Save a hospital for the authenticated user
  app.post("/api/hospitals/saved/:hospitalId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      
      if (isNaN(hospitalId)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      const success = await storage.saveHospital(req.user.id, hospitalId);
      
      if (!success) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json({ message: "Hospital saved successfully" });
    } catch (error) {
      console.error("Error saving hospital:", error);
      res.status(500).json({ message: "Failed to save hospital" });
    }
  });
  
  // Remove a saved hospital for the authenticated user
  app.delete("/api/hospitals/saved/:hospitalId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      
      if (isNaN(hospitalId)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      const success = await storage.removeSavedHospital(req.user.id, hospitalId);
      
      if (!success) {
        return res.status(404).json({ message: "Saved hospital not found" });
      }
      
      res.json({ message: "Hospital removed successfully" });
    } catch (error) {
      console.error("Error removing saved hospital:", error);
      res.status(500).json({ message: "Failed to remove saved hospital" });
    }
  });
  
  // Get a specific hospital
  app.get("/api/hospitals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      const hospital = await storage.getHospital(id);
      
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      res.status(500).json({ message: "Failed to fetch hospital" });
    }
  });
  
  // Create a new hospital (admin only)
  app.post("/api/hospitals", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      const result = insertHospitalSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hospital data", errors: result.error.errors });
      }
      
      const hospital = await storage.createHospital(result.data);
      res.status(201).json(hospital);
    } catch (error) {
      console.error("Error creating hospital:", error);
      res.status(500).json({ message: "Failed to create hospital" });
    }
  });
  
  // Update a hospital (admin only)
  app.patch("/api/hospitals/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      // Validate request body
      const result = insertHospitalSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hospital data", errors: result.error.errors });
      }
      
      const hospital = await storage.updateHospital(id, result.data);
      
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error) {
      console.error("Error updating hospital:", error);
      res.status(500).json({ message: "Failed to update hospital" });
    }
  });
  
  // Delete a hospital (admin only)
  app.delete("/api/hospitals/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      const success = await storage.deleteHospital(id);
      
      if (!success) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json({ message: "Hospital deleted successfully" });
    } catch (error) {
      console.error("Error deleting hospital:", error);
      res.status(500).json({ message: "Failed to delete hospital" });
    }
  });
  
  // Get all doctors for a specific hospital
  app.get("/api/doctors/hospital/:hospitalId", async (req: Request, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      
      if (isNaN(hospitalId)) {
        return res.status(400).json({ message: "Invalid hospital ID" });
      }
      
      const doctors = await storage.getDoctorsByHospital(hospitalId);
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });
  
  // Get all doctors (admin only)
  app.get("/api/doctors", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching all doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });
  
  // Create a new doctor (admin only)
  app.post("/api/doctors", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      const result = insertDoctorSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid doctor data", errors: result.error.errors });
      }
      
      const doctor = await storage.createDoctor(result.data);
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });
  
  // Delete a doctor (admin only)
  app.delete("/api/doctors/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const success = await storage.deleteDoctor(id);
      
      if (!success) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });
}
