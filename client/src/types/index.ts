// Common type for pagination responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Gemini AI related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Hospital search related types
export interface SearchParams {
  query?: string;
  location?: string;
  specialty?: string;
  rating?: number;
  distance?: number;
  page?: number;
  limit?: number;
}

export interface GeolocationPosition {
  lat: number;
  lng: number;
}

// Booking related types
export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  doctorId: number;
  date: string;
}

export interface BookingRequest {
  doctorId: number;
  hospitalId: number;
  date: string;
  time: string;
  notes?: string;
}

// Mental health related types
export interface MoodEntry {
  id: string;
  mood: 'happy' | 'sad' | 'neutral' | 'anxious' | 'angry' | 'calm';
  intensity: number; // 1-10
  notes: string;
  date: string;
}

export interface MeditationSession {
  id: string;
  title: string;
  duration: number; // in minutes
  category: 'sleep' | 'stress' | 'focus' | 'anxiety' | 'general';
  audioUrl?: string;
}

export interface BreathingExercise {
  id: string;
  name: string;
  inhaleDuration: number; // in seconds
  holdDuration: number; // in seconds
  exhaleDuration: number; // in seconds
  repetitions: number;
}

// First aid related types
export interface FirstAidCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FirstAidStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
}

// User profile related types
export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  newsletter: boolean;
  language: string;
}

export interface SavedItem {
  id: number;
  type: 'hospital' | 'doctor' | 'first-aid' | 'mental-health';
  itemId: number;
  savedAt: string;
}

// Admin dashboard related types
export interface AdminStats {
  totalUsers: number;
  totalHospitals: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  userGrowth: {
    date: string;
    count: number;
  }[];
}
