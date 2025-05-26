import { Express, Request, Response } from "express";
import { IStorage } from "../storage";
import { MongoStorage } from "../storage/mongodb";
import { z } from "zod";
import { insertAppointmentSchema, type Appointment, type InsertAppointment } from "@shared/schema";

// Create storage instance
const storage = new MongoStorage();

// Setup bookings/appointments routes
export function setupBookingRoutes(app: Express): void {
  // Get appointments for authenticated user
  app.get("/api/appointments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const appointments = await storage.getUserAppointments(req.user.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  // Get all appointments (admin only)
  app.get("/api/appointments/all", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  // Create a new appointment
  app.post("/api/appointments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { userId, doctorId, hospitalId, date, time, notes, reminderPreferences } = req.body;

      // Validate appointment data
      if (!userId || !doctorId || !hospitalId || !date || !time) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if hospital and doctor exist
      const hospital = await storage.getHospital(hospitalId);
      const doctor = await storage.getDoctor(doctorId);
      if (!hospital || !doctor) {
        return res.status(404).json({ error: "Hospital or doctor not found" });
      }

      // Create appointment
      const appointment = await storage.createAppointment({
        userId,
        doctorId,
        hospitalId,
        date,
        time,
        notes,
        reminderPreferences
      });

      // Create reminders if preferences are set
      if (reminderPreferences) {
        const { sms, whatsapp, email, intervals } = reminderPreferences;
        const appointmentDateTime = new Date(`${date}T${time}`);

        // Create reminders for each selected channel and interval
        for (const hours of intervals) {
          const scheduledFor = new Date(appointmentDateTime.getTime() - hours * 60 * 60 * 1000);

          if (sms) {
            await storage.createReminder({
              appointmentId: appointment.id,
              type: "sms",
              status: "pending",
              scheduledFor
            });
          }

          if (whatsapp) {
            await storage.createReminder({
              appointmentId: appointment.id,
              type: "whatsapp",
              status: "pending",
              scheduledFor
            });
          }

          if (email) {
            await storage.createReminder({
              appointmentId: appointment.id,
              type: "email",
              status: "pending",
              scheduledFor
            });
          }
        }
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });
  
  // Update appointment status
  app.post("/api/appointments/:id/status", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      // Validate status
      const statusSchema = z.object({
        status: z.enum(["pending", "confirmed", "cancelled"])
      });
      
      const result = statusSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid status", errors: result.error.errors });
      }
      
      // Get the appointment
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user owns this appointment or is an admin
      if (appointment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update the status
      const updatedAppointment = await storage.updateAppointmentStatus(id, result.data.status);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });
  
  // Cancel an appointment
  app.post("/api/appointments/:id/cancel", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      // Get the appointment
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user owns this appointment or is an admin
      if (appointment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update the status to cancelled
      const updatedAppointment = await storage.updateAppointmentStatus(id, "cancelled");
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });
  
  // Delete an appointment (admin only)
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
}
