import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("user").notNull(),
  preferences: json("preferences").$type<{ darkMode: boolean; notifications: boolean }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
});

// Hospitals table
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  openHours: text("open_hours"),
  specialties: json("specialties").$type<string[]>(),
  rating: integer("rating"),
  imageUrl: text("image_url"),
  distance: text("distance"),
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hospitalId: integer("hospital_id").notNull(),
  specialty: text("specialty").notNull(),
  availability: json("availability").$type<{ day: string; slots: string[] }[]>(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  rating: integer("rating"),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  hospitalId: integer("hospital_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // user or assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true
});

// First aid tips table
export const firstAidTips = pgTable("first_aid_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  steps: json("steps").$type<{ step: number; title: string; description: string }[]>(),
  imageUrl: text("image_url"),
});

export const insertFirstAidTipSchema = createInsertSchema(firstAidTips).omit({
  id: true
});

// Mental health resources table
export const mentalHealthResources = pgTable("mental_health_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  steps: json("steps").$type<{ step: number; title: string; description: string }[]>(),
  imageUrl: text("image_url"),
});

export const insertMentalHealthResourceSchema = createInsertSchema(mentalHealthResources).omit({
  id: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type FirstAidTip = typeof firstAidTips.$inferSelect;
export type InsertFirstAidTip = z.infer<typeof insertFirstAidTipSchema>;

export type MentalHealthResource = typeof mentalHealthResources.$inferSelect;
export type InsertMentalHealthResource = z.infer<typeof insertMentalHealthResourceSchema>;
