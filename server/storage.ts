import { users, type User, type InsertUser, hospitals, type Hospital, type InsertHospital, doctors, type Doctor, type InsertDoctor, appointments, type Appointment, type InsertAppointment, chatMessages, type ChatMessage, type InsertChatMessage, firstAidTips, type FirstAidTip, type InsertFirstAidTip, mentalHealthResources, type MentalHealthResource, type InsertMentalHealthResource } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Hospital operations
  getHospital(id: number): Promise<Hospital | undefined>;
  getAllHospitals(): Promise<Hospital[]>;
  getHospitalsByFilters(filters: {location?: string, specialty?: string}): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: number, hospital: Partial<InsertHospital>): Promise<Hospital | undefined>;
  deleteHospital(id: number): Promise<boolean>;
  getSavedHospitals(userId: number): Promise<Hospital[]>;
  saveHospital(userId: number, hospitalId: number): Promise<boolean>;
  removeSavedHospital(userId: number, hospitalId: number): Promise<boolean>;
  
  // Doctor operations
  getDoctor(id: number): Promise<Doctor | undefined>;
  getAllDoctors(): Promise<Doctor[]>;
  getDoctorsByHospital(hospitalId: number): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: number): Promise<boolean>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Chat operations
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // First aid operations
  getFirstAidTip(id: number): Promise<FirstAidTip | undefined>;
  getAllFirstAidTips(): Promise<FirstAidTip[]>;
  getFirstAidTipsByCategory(category: string): Promise<FirstAidTip[]>;
  createFirstAidTip(tip: InsertFirstAidTip): Promise<FirstAidTip>;
  
  // Mental health operations
  getMentalHealthResource(id: number): Promise<MentalHealthResource | undefined>;
  getAllMentalHealthResources(): Promise<MentalHealthResource[]>;
  getMentalHealthResourcesByCategory(category: string): Promise<MentalHealthResource[]>;
  createMentalHealthResource(resource: InsertMentalHealthResource): Promise<MentalHealthResource>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hospitals: Map<number, Hospital>;
  private doctors: Map<number, Doctor>;
  private appointments: Map<number, Appointment>;
  private chatMessages: Map<number, ChatMessage>;
  private firstAidTips: Map<number, FirstAidTip>;
  private mentalHealthResources: Map<number, MentalHealthResource>;
  private savedHospitals: Map<number, Set<number>>;
  
  sessionStore: session.Store;
  currentId: {
    users: number;
    hospitals: number;
    doctors: number;
    appointments: number;
    chatMessages: number;
    firstAidTips: number;
    mentalHealthResources: number;
  };

  constructor() {
    this.users = new Map();
    this.hospitals = new Map();
    this.doctors = new Map();
    this.appointments = new Map();
    this.chatMessages = new Map();
    this.firstAidTips = new Map();
    this.mentalHealthResources = new Map();
    this.savedHospitals = new Map();
    
    this.currentId = {
      users: 1,
      hospitals: 1,
      doctors: 1,
      appointments: 1,
      chatMessages: 1,
      firstAidTips: 1,
      mentalHealthResources: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some data
    this.initializeData();
  }
  
  private initializeData(): void {
    // Add an admin user
    this.createUser({
      username: "admin",
      email: "admin@aihealthassistant.com",
      password: "admin123", // This would be hashed in the auth.ts file
      name: "Admin User",
      role: "admin"
    });
    
    // Add some sample hospitals
    this.createHospital({
      name: "City General Hospital",
      address: "1234 Medical Drive, City Center",
      latitude: "40.7128",
      longitude: "-74.0060",
      phone: "(555) 123-4567",
      email: "info@cityhospital.com",
      website: "https://cityhospital.com",
      openHours: "Open 24/7",
      specialties: ["General Care", "Emergency", "Pediatrics"],
      rating: 4,
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjE3MDE5NjQ5&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit",
      distance: "2.3 km"
    });
    
    this.createHospital({
      name: "Westside Medical Center",
      address: "567 Health Avenue, Westside",
      latitude: "40.7228",
      longitude: "-74.0160",
      phone: "(555) 234-5678",
      email: "info@westsidemedical.com",
      website: "https://westsidemedical.com",
      openHours: "Open 8AM-10PM",
      specialties: ["General Care", "Dental", "Cardiology"],
      rating: 4,
      imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjE3MDE5NjQ5&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit",
      distance: "3.8 km"
    });
    
    this.createHospital({
      name: "Eastside Urgent Care",
      address: "789 Care Street, Eastside",
      latitude: "40.7328",
      longitude: "-74.0260",
      phone: "(555) 345-6789",
      email: "info@eastsidecare.com",
      website: "https://eastsidecare.com",
      openHours: "Open 9AM-9PM",
      specialties: ["Urgent Care", "X-Ray", "Lab Tests"],
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjE3MDE5NjQ5&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit",
      distance: "4.2 km"
    });
    
    // Add some doctors
    this.createDoctor({
      name: "Dr. John Smith",
      hospitalId: 1,
      specialty: "Cardiology",
      availability: [
        { day: "Monday", slots: ["09:00", "10:00", "11:00"] },
        { day: "Wednesday", slots: ["14:00", "15:00", "16:00"] },
        { day: "Friday", slots: ["09:00", "10:00", "11:00"] }
      ],
      imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Dr. Smith is a cardiologist with over 15 years of experience in treating heart conditions.",
      rating: 5
    });
    
    this.createDoctor({
      name: "Dr. Sarah Johnson",
      hospitalId: 1,
      specialty: "Pediatrics",
      availability: [
        { day: "Tuesday", slots: ["09:00", "10:00", "11:00"] },
        { day: "Thursday", slots: ["14:00", "15:00", "16:00"] }
      ],
      imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
      bio: "Dr. Johnson specializes in pediatric care and has been practicing for 10 years.",
      rating: 4
    });
    
    this.createDoctor({
      name: "Dr. Michael Chen",
      hospitalId: 2,
      specialty: "General Practice",
      availability: [
        { day: "Monday", slots: ["13:00", "14:00", "15:00"] },
        { day: "Wednesday", slots: ["09:00", "10:00", "11:00"] },
        { day: "Friday", slots: ["13:00", "14:00", "15:00"] }
      ],
      imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
      bio: "Dr. Chen is a general practitioner who focuses on preventive care and holistic health.",
      rating: 5
    });
    
    // Add first aid tips
    this.createFirstAidTip({
      title: "CPR (Cardiopulmonary Resuscitation)",
      category: "cpr",
      content: "CPR can help save a life during a heart attack or near drowning.",
      steps: [
        { step: 1, title: "Check responsiveness", description: "Tap the person and shout 'Are you OK?' to ensure they're unresponsive." },
        { step: 2, title: "Call for help", description: "Call 911 or ask someone else to call while you begin CPR." },
        { step: 3, title: "Place in position", description: "Place the person on their back on a firm surface." },
        { step: 4, title: "Start chest compressions", description: "Place hands in the center of the chest and push hard and fast at a rate of 100-120 compressions per minute. Allow the chest to completely recoil between compressions." },
        { step: 5, title: "Open airway and give breaths", description: "After 30 compressions, tilt the head back and lift the chin. Give 2 rescue breaths (if trained and willing), each lasting 1 second." },
        { step: 6, title: "Continue CPR", description: "Continue cycles of 30 compressions and 2 breaths until emergency services arrive or the person shows signs of life." }
      ],
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
    });
    
    this.createFirstAidTip({
      title: "Bleeding Control",
      category: "bleeding",
      content: "Learn how to stop bleeding and prevent infection in wounds.",
      steps: [
        { step: 1, title: "Apply pressure", description: "Use a clean cloth or bandage and apply firm pressure to the wound." },
        { step: 2, title: "Elevate the wound", description: "If possible, elevate the wound above the level of the heart to reduce blood flow." },
        { step: 3, title: "Clean the wound", description: "Once bleeding slows, clean with mild soap and water." },
        { step: 4, title: "Apply bandage", description: "Cover with a sterile bandage or dressing." },
        { step: 5, title: "Seek medical attention", description: "For deep wounds, wounds that won't stop bleeding, or wounds from rusty objects, seek immediate medical care." }
      ],
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
    });
    
    // Add mental health resources
    this.createMentalHealthResource({
      title: "Breathing Exercise",
      category: "exercise",
      content: "Practice deep breathing to reduce stress and anxiety.",
      steps: [
        { step: 1, title: "Find a comfortable position", description: "Sit or lie down in a comfortable position." },
        { step: 2, title: "Breathe in", description: "Inhale slowly through your nose for 4 seconds, filling your lungs completely." },
        { step: 3, title: "Hold", description: "Hold your breath for 7 seconds." },
        { step: 4, title: "Exhale", description: "Exhale completely through your mouth for 8 seconds." },
        { step: 5, title: "Repeat", description: "Repeat the cycle 4-5 times or until you feel calmer." }
      ],
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
    });
    
    this.createMentalHealthResource({
      title: "Practice self-compassion",
      category: "dailyTip",
      content: "Treat yourself with the same kindness and understanding you would offer to a good friend. Remember that imperfection is part of the shared human experience – something that we all go through rather than something that happens to 'me' alone.",
      steps: [],
      imageUrl: ""
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Hospital operations
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }
  
  async getAllHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }
  
  async getHospitalsByFilters(filters: {location?: string, specialty?: string}): Promise<Hospital[]> {
    let result = Array.from(this.hospitals.values());
    
    if (filters.location) {
      // In a real app, this would use geolocation services
      result = result.filter(hospital => 
        hospital.address.toLowerCase().includes(filters.location!.toLowerCase()) ||
        hospital.latitude.includes(filters.location!) ||
        hospital.longitude.includes(filters.location!)
      );
    }
    
    if (filters.specialty) {
      result = result.filter(hospital => 
        hospital.specialties?.some(s => 
          s.toLowerCase().includes(filters.specialty!.toLowerCase())
        )
      );
    }
    
    return result;
  }
  
  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = this.currentId.hospitals++;
    const hospital: Hospital = { ...insertHospital, id };
    this.hospitals.set(id, hospital);
    return hospital;
  }
  
  async updateHospital(id: number, hospitalUpdate: Partial<InsertHospital>): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (!hospital) return undefined;
    
    const updatedHospital = { ...hospital, ...hospitalUpdate };
    this.hospitals.set(id, updatedHospital);
    return updatedHospital;
  }
  
  async deleteHospital(id: number): Promise<boolean> {
    return this.hospitals.delete(id);
  }
  
  async getSavedHospitals(userId: number): Promise<Hospital[]> {
    const savedIds = this.savedHospitals.get(userId) || new Set<number>();
    return Array.from(savedIds).map(id => this.hospitals.get(id)!).filter(Boolean);
  }
  
  async saveHospital(userId: number, hospitalId: number): Promise<boolean> {
    if (!this.hospitals.has(hospitalId)) return false;
    
    if (!this.savedHospitals.has(userId)) {
      this.savedHospitals.set(userId, new Set<number>());
    }
    
    this.savedHospitals.get(userId)!.add(hospitalId);
    return true;
  }
  
  async removeSavedHospital(userId: number, hospitalId: number): Promise<boolean> {
    if (!this.savedHospitals.has(userId)) return false;
    return this.savedHospitals.get(userId)!.delete(hospitalId);
  }
  
  // Doctor operations
  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }
  
  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }
  
  async getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(
      doctor => doctor.hospitalId === hospitalId
    );
  }
  
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentId.doctors++;
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }
  
  async updateDoctor(id: number, doctorUpdate: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const updatedDoctor = { ...doctor, ...doctorUpdate };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }
  
  async deleteDoctor(id: number): Promise<boolean> {
    return this.doctors.delete(id);
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.userId === userId
    );
  }
  
  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId.appointments++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      status: insertAppointment.status || "pending",
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Chat operations
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      message => message.userId === userId
    );
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId.chatMessages++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  
  // First aid operations
  async getFirstAidTip(id: number): Promise<FirstAidTip | undefined> {
    return this.firstAidTips.get(id);
  }
  
  async getAllFirstAidTips(): Promise<FirstAidTip[]> {
    return Array.from(this.firstAidTips.values());
  }
  
  async getFirstAidTipsByCategory(category: string): Promise<FirstAidTip[]> {
    return Array.from(this.firstAidTips.values()).filter(
      tip => tip.category === category
    );
  }
  
  async createFirstAidTip(insertTip: InsertFirstAidTip): Promise<FirstAidTip> {
    const id = this.currentId.firstAidTips++;
    const tip: FirstAidTip = { ...insertTip, id };
    this.firstAidTips.set(id, tip);
    return tip;
  }
  
  // Mental health operations
  async getMentalHealthResource(id: number): Promise<MentalHealthResource | undefined> {
    return this.mentalHealthResources.get(id);
  }
  
  async getAllMentalHealthResources(): Promise<MentalHealthResource[]> {
    return Array.from(this.mentalHealthResources.values());
  }
  
  async getMentalHealthResourcesByCategory(category: string): Promise<MentalHealthResource[]> {
    return Array.from(this.mentalHealthResources.values()).filter(
      resource => resource.category === category
    );
  }
  
  async createMentalHealthResource(insertResource: InsertMentalHealthResource): Promise<MentalHealthResource> {
    const id = this.currentId.mentalHealthResources++;
    const resource: MentalHealthResource = { ...insertResource, id };
    this.mentalHealthResources.set(id, resource);
    return resource;
  }
}

export const storage = new MemStorage();
