import { Express } from 'express';
import { IStorage } from './storage';
import { setupAuthRoutes } from './api/auth';
import { setupChatRoutes } from './api/chat';
import { setupHospitalRoutes } from './api/hospitals';
import { setupBookingRoutes } from './api/booking';
import { setupDoctorRoutes } from './api/doctors';
import { setupAdminRoutes } from './api/admin';
import { setupDoctorDashboardRoutes } from './api/doctor-dashboard';
import { initializeAIRoutes } from './routes/ai';

export function registerRoutes(app: Express, storage: IStorage) {
  // Register AI routes
  app.use('/api/ai', initializeAIRoutes());

  // Register core routes first
  setupAuthRoutes(app, storage);
  setupHospitalRoutes(app, storage);
  setupBookingRoutes(app, storage);
  
  // Register doctor-related routes
  setupDoctorRoutes(app);
  setupDoctorDashboardRoutes(app, storage);
  
  // Register admin routes last
  setupAdminRoutes(app, storage);
  
  // Register chat routes
  setupChatRoutes(app, storage);
}
