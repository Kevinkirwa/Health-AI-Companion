import { users, type User, type InsertUser, hospitals, type Hospital, type InsertHospital, doctors, type Doctor, type InsertDoctor, appointments, type Appointment, type InsertAppointment, chatHistory, type ChatHistory, type InsertChatHistory, type Message } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Hospital methods
  getHospital(id: number): Promise<Hospital | undefined>;
  getAllHospitals(): Promise<Hospital[]>;
  getHospitalsBySpecialty(specialty: string): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  
  // Doctor methods
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsByHospital(hospitalId: number): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Chat history methods
  getChatHistory(userId: number): Promise<ChatHistory | undefined>;
  createChatHistory(chatHistory: InsertChatHistory): Promise<ChatHistory>;
  updateChatHistory(id: number, messages: Message[]): Promise<ChatHistory | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hospitals: Map<number, Hospital>;
  private doctors: Map<number, Doctor>;
  private appointments: Map<number, Appointment>;
  private chatHistories: Map<number, ChatHistory>;
  
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentHospitalId: number;
  currentDoctorId: number;
  currentAppointmentId: number;
  currentChatHistoryId: number;

  constructor() {
    this.users = new Map();
    this.hospitals = new Map();
    this.doctors = new Map();
    this.appointments = new Map();
    this.chatHistories = new Map();
    
    this.currentUserId = 1;
    this.currentHospitalId = 1;
    this.currentDoctorId = 1;
    this.currentAppointmentId = 1;
    this.currentChatHistoryId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Pre-populate with mock hospitals and doctors for demo
    this.seedHospitals();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, role: "user", prefersDarkMode: false, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Hospital methods
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }
  
  async getAllHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }
  
  async getHospitalsBySpecialty(specialty: string): Promise<Hospital[]> {
    return Array.from(this.hospitals.values()).filter(
      (hospital) => hospital.specialties.includes(specialty)
    );
  }
  
  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = this.currentHospitalId++;
    const hospital: Hospital = { ...insertHospital, id };
    this.hospitals.set(id, hospital);
    return hospital;
  }
  
  // Doctor methods
  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }
  
  async getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(
      (doctor) => doctor.hospitalId === hospitalId
    );
  }
  
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }
  
  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { ...insertAppointment, id, createdAt: new Date() };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Chat history methods
  async getChatHistory(userId: number): Promise<ChatHistory | undefined> {
    return Array.from(this.chatHistories.values()).find(
      (history) => history.userId === userId
    );
  }
  
  async createChatHistory(insertChatHistory: InsertChatHistory): Promise<ChatHistory> {
    const id = this.currentChatHistoryId++;
    const chatHistory: ChatHistory = { ...insertChatHistory, id, createdAt: new Date() };
    this.chatHistories.set(id, chatHistory);
    return chatHistory;
  }
  
  async updateChatHistory(id: number, messages: Message[]): Promise<ChatHistory | undefined> {
    const chatHistory = await this.chatHistories.get(id);
    if (!chatHistory) return undefined;
    
    const updatedChatHistory = { ...chatHistory, messages };
    this.chatHistories.set(id, updatedChatHistory);
    return updatedChatHistory;
  }
  
  // Seed data
  private seedHospitals() {
    const hospitals = [
      {
        id: 1,
        name: 'City General Hospital',
        address: '123 Medical Avenue, Downtown',
        rating: 4.8,
        specialties: ['General', 'Emergency', 'Cardiology'],
        distance: '1.2 km',
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        latitude: '37.7749',
        longitude: '-122.4194'
      },
      {
        id: 2,
        name: 'Sunshine Medical Center',
        address: '456 Health Street, Westside',
        rating: 4.5,
        specialties: ['Pediatric', 'Dental', 'Neurology'],
        distance: '2.5 km',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        latitude: '37.7899',
        longitude: '-122.4084'
      },
      {
        id: 3,
        name: 'Central Care Hospital',
        address: '789 Healthcare Road, Northside',
        rating: 4.9,
        specialties: ['General', 'Orthopedic', 'Ophthalmology'],
        distance: '3.8 km',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        latitude: '37.7649',
        longitude: '-122.4294'
      },
      {
        id: 4,
        name: 'Eastside Medical Plaza',
        address: '101 Wellness Blvd, Eastside',
        rating: 4.3,
        specialties: ['General', 'Gynecology', 'Dermatology'],
        distance: '4.2 km',
        image: 'https://images.unsplash.com/photo-1631217862291-7d586641dd7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        latitude: '37.7849',
        longitude: '-122.3994'
      }
    ];
    
    hospitals.forEach(hospital => {
      this.hospitals.set(hospital.id, hospital);
    });
    this.currentHospitalId = 5;
    
    // Add doctors for each hospital
    const doctors = [
      {
        id: 1,
        name: 'Dr. Emily Carter',
        specialty: 'Cardiologist',
        hospitalId: 1,
        availability: 'Available today',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 2,
        name: 'Dr. Michael Johnson',
        specialty: 'General Physician',
        hospitalId: 1,
        availability: 'Available tomorrow',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 3,
        name: 'Dr. Sarah Williams',
        specialty: 'Pediatrician',
        hospitalId: 2,
        availability: 'Available today',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 4,
        name: 'Dr. James Smith',
        specialty: 'Neurologist',
        hospitalId: 2,
        availability: 'Available Friday',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 5,
        name: 'Dr. Lisa Chen',
        specialty: 'Orthopedic Surgeon',
        hospitalId: 3,
        availability: 'Available today',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 6,
        name: 'Dr. Robert Wilson',
        specialty: 'Ophthalmologist',
        hospitalId: 3,
        availability: 'Available Wednesday',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 7,
        name: 'Dr. Maria Rodriguez',
        specialty: 'Gynecologist',
        hospitalId: 4,
        availability: 'Available Thursday',
        image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 8,
        name: 'Dr. David Kim',
        specialty: 'Dermatologist',
        hospitalId: 4,
        availability: 'Available today',
        image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
      }
    ];
    
    doctors.forEach(doctor => {
      this.doctors.set(doctor.id, doctor);
    });
    this.currentDoctorId = 9;
  }
}

export const storage = new MemStorage();
