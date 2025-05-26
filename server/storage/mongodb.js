const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/passwordUtils');
const User = require('../models/User');
const { Hospital } = require('../models/Hospital');
const { Doctor } = require('../models/Doctor');
const { Appointment } = require('../models/Appointment');
const { ChatMessage } = require('../models/ChatMessage');
const { FirstAidTip } = require('../models/FirstAidTip');
const { MentalHealthResource } = require('../models/MentalHealthResource');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const MedicalRecord = require('../models/MedicalRecord');
const Schedule = require('../models/Schedule');

class MongoStorage {
  constructor() {
    // Initialize models
    this.User = User;
    this.Hospital = Hospital;
    this.Doctor = Doctor;
    this.Appointment = Appointment;
    this.ChatMessage = ChatMessage;
    this.FirstAidTip = FirstAidTip;
    this.MentalHealthResource = MentalHealthResource;
    this.Reminder = Reminder;
    this.Notification = Notification;
    this.MedicalRecord = MedicalRecord;
    this.Schedule = Schedule;

    // Create session store
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || '',
      ttl: 24 * 60 * 60, // 1 day
      collectionName: 'sessions'
    });

    // Initialize connection promise
    this._connectionPromise = null;
    this._isConnected = false;

    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
      this._isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      this._isConnected = false;
    });
  }

  // Add a method to check connection
  async ensureConnection() {
    if (this._isConnected) {
      return;
    }

    if (!this._connectionPromise) {
      this._connectionPromise = new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
          this._isConnected = true;
          resolve();
        } else {
          mongoose.connection.once('connected', () => {
            this._isConnected = true;
            resolve();
          });
          mongoose.connection.once('error', (err) => {
            this._connectionPromise = null;
            reject(err);
          });
        }
      });
    }

    try {
      await this._connectionPromise;
    } catch (error) {
      this._connectionPromise = null;
      throw new Error('Failed to connect to MongoDB: ' + error.message);
    }
  }

  // User operations
  async getUser(id) {
    await this.ensureConnection();
    try {
      const user = await this.User.findById(id);
      return user ? user.toObject() : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByUsername(username) {
    await this.ensureConnection();
    try {
      const user = await this.User.findOne({ username });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email) {
    await this.ensureConnection();
    try {
      const user = await this.User.findOne({ email });
      console.log('User found by email:', user ? 'Yes' : 'No');
      return user ? user.toObject() : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserById(id) {
    await this.ensureConnection();
    return await this.User.findById(id);
  }

  async getAllUsers() {
    await this.ensureConnection();
    try {
      const users = await this.User.find();
      return users.map(user => user.toObject());
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async createUser(insertUser) {
    await this.ensureConnection();
    const user = new this.User({
      ...insertUser,
      role: insertUser.role || 'user',
      preferences: { darkMode: false, notifications: true }
    });
    await user.save();
    return user.toObject();
  }

  // Hospital operations
  async getHospital(id) {
    await this.ensureConnection();
    try {
      if (id === 'all') {
        return this.getAllHospitals();
      }
      const hospital = await this.Hospital.findById(id);
      return hospital ? hospital.toObject() : undefined;
    } catch (error) {
      console.error('Error getting hospital:', error);
      return undefined;
    }
  }

  async getAllHospitals() {
    await this.ensureConnection();
    try {
      const hospitals = await this.Hospital.find();
      return hospitals.map(hospital => hospital.toObject());
    } catch (error) {
      console.error('Error getting all hospitals:', error);
      return [];
    }
  }
  
  async getHospitalsByIds(hospitalIds) {
    await this.ensureConnection();
    try {
      console.log('🔍 Finding hospitals with IDs:', hospitalIds);
      const hospitals = await this.Hospital.find({
        _id: { $in: hospitalIds }
      });
      console.log(`✅ Found ${hospitals.length} hospitals`);
      return hospitals.map(hospital => hospital.toObject());
    } catch (error) {
      console.error('❌ Error getting hospitals by IDs:', error);
      return [];
    }
  }

  async getHospitalsForDoctor(doctorId) {
    await this.ensureConnection();
    try {
      console.log('🔍 Finding hospitals for doctor ID:', doctorId);
      // Look for hospitals where the doctor is listed
      const hospitals = await this.Hospital.find({
        doctors: doctorId
      });
      
      if (hospitals.length === 0) {
        console.log('⚠️ No hospitals found for doctor, checking for default hospital');
        // If no hospitals found, return at least the first hospital as a fallback
        const defaultHospital = await this.Hospital.findOne();
        return defaultHospital ? [defaultHospital.toObject()] : [];
      }
      
      console.log(`✅ Found ${hospitals.length} hospitals for doctor`);
      return hospitals.map(hospital => hospital.toObject());
    } catch (error) {
      console.error('❌ Error getting hospitals for doctor:', error);
      return [];
    }
  }

  async getHospitalsByFilters(filters) {
    await this.ensureConnection();
    try {
      const query = {};
      
      // Handle search query
      if (filters.$or) {
        query.$or = filters.$or;
      }
      
      // Handle county filter
      if (filters.county) {
        query.county = filters.county;
      }
      
      // Handle specialty filter
      if (filters.specialties) {
        query.specialties = filters.specialties;
      }
      
      const hospitals = await this.Hospital.find(query)
        .populate('doctors', 'name specialty availability rating')
        .select('-__v');
      
      return hospitals.map(hospital => hospital.toObject());
    } catch (error) {
      console.error('Error getting hospitals by filters:', error);
      throw error;
    }
  }

  async createHospital(insertHospital) {
    await this.ensureConnection();
    const hospital = new this.Hospital(insertHospital);
    await hospital.save();
    return hospital.toObject();
  }

  async updateHospital(id, hospitalUpdate) {
    await this.ensureConnection();
    const hospital = await this.Hospital.findByIdAndUpdate(id, hospitalUpdate, { new: true });
    return hospital ? hospital.toObject() : undefined;
  }

  async deleteHospital(id) {
    await this.ensureConnection();
    const result = await this.Hospital.findByIdAndDelete(id);
    return !!result;
  }

  // Doctor operations
  async getDoctor(id) {
    await this.ensureConnection();
    const doctor = await this.Doctor.findById(id);
    return doctor ? doctor.toObject() : undefined;
  }

  async getAllDoctors() {
    await this.ensureConnection();
    try {
      const doctors = await this.Doctor.find();
      return doctors.map(doctor => doctor.toObject());
    } catch (error) {
      console.error('Error getting all doctors:', error);
      return [];
    }
  }

  async getDoctorsByHospital(hospitalId) {
    await this.ensureConnection();
    const doctors = await this.Doctor.find({ hospitalId });
    return doctors.map(doctor => doctor.toObject());
  }

  async createDoctor(insertDoctor) {
    await this.ensureConnection();
    const doctor = new this.Doctor(insertDoctor);
    await doctor.save();
    return doctor.toObject();
  }

  async updateDoctor(id, doctorUpdate) {
    await this.ensureConnection();
    const doctor = await this.Doctor.findByIdAndUpdate(id, doctorUpdate, { new: true });
    return doctor ? doctor.toObject() : undefined;
  }

  async deleteDoctor(id) {
    await this.ensureConnection();
    const result = await this.Doctor.findByIdAndDelete(id);
    return !!result;
  }

  // Appointment operations
  async getAppointment(id) {
    await this.ensureConnection();
    try {
      if (id === 'all') {
        return this.getAllAppointments();
      }
      const appointment = await this.Appointment.findById(id);
      return appointment ? appointment.toObject() : undefined;
    } catch (error) {
      console.error('Error getting appointment:', error);
      return undefined;
    }
  }

  async getUserAppointments(userId) {
    await this.ensureConnection();
    const appointments = await this.Appointment.find({ userId });
    return appointments.map(appointment => appointment.toObject());
  }

  async getAllAppointments() {
    await this.ensureConnection();
    try {
      const appointments = await this.Appointment.find();
      return appointments.map(appointment => appointment.toObject());
    } catch (error) {
      console.error('Error getting all appointments:', error);
      return [];
    }
  }

  async createAppointment(insertAppointment) {
    await this.ensureConnection();
    const appointment = new this.Appointment({
      ...insertAppointment,
      status: insertAppointment.status || 'pending'
    });
    await appointment.save();
    return appointment.toObject();
  }

  async updateAppointmentStatus(id, status) {
    await this.ensureConnection();
    const appointment = await this.Appointment.findByIdAndUpdate(id, { status }, { new: true });
    return appointment ? appointment.toObject() : undefined;
  }

  async updateAppointmentNotes(id, notes) {
    await this.ensureConnection();
    const appointment = await this.Appointment.findByIdAndUpdate(id, { notes }, { new: true });
    return appointment ? appointment.toObject() : undefined;
  }

  async deleteAppointment(id) {
    await this.ensureConnection();
    const result = await this.Appointment.findByIdAndDelete(id);
    return !!result;
  }

  async getDoctorAppointments(doctorId) {
    await this.ensureConnection();
    const appointments = await this.Appointment.find({ doctorId });
    return appointments.map(appointment => appointment.toObject());
  }

  async getDoctorPatients(doctorId) {
    await this.ensureConnection();
    const appointments = await this.Appointment.find({ doctorId }).distinct('userId');
    const users = await this.User.find({ _id: { $in: appointments } });
    return users.map(user => user.toObject());
  }

  // Chat operations
  async getChatMessages(userId) {
    await this.ensureConnection();
    const messages = await this.ChatMessage.find({ userId }).sort({ timestamp: 1 });
    return messages.map(message => message.toObject());
  }

  async createChatMessage(message) {
    await this.ensureConnection();
    const chatMessage = new this.ChatMessage(message);
    await chatMessage.save();
    return chatMessage.toObject();
  }

  // First Aid operations
  async getFirstAidTip(id) {
    await this.ensureConnection();
    const tip = await this.FirstAidTip.findById(id);
    return tip ? tip.toObject() : undefined;
  }

  async getAllFirstAidTips() {
    await this.ensureConnection();
    const tips = await this.FirstAidTip.find();
    return tips.map(tip => tip.toObject());
  }

  async getFirstAidTipsByCategory(category) {
    await this.ensureConnection();
    const tips = await this.FirstAidTip.find({ category });
    return tips.map(tip => tip.toObject());
  }

  async createFirstAidTip(tip) {
    await this.ensureConnection();
    const firstAidTip = new this.FirstAidTip(tip);
    await firstAidTip.save();
    return firstAidTip.toObject();
  }

  // Mental Health operations
  async getMentalHealthResource(id) {
    await this.ensureConnection();
    const resource = await this.MentalHealthResource.findById(id);
    return resource ? resource.toObject() : undefined;
  }

  async getAllMentalHealthResources() {
    await this.ensureConnection();
    const resources = await this.MentalHealthResource.find();
    return resources.map(resource => resource.toObject());
  }

  async getMentalHealthResourcesByCategory(category) {
    await this.ensureConnection();
    const resources = await this.MentalHealthResource.find({ category });
    return resources.map(resource => resource.toObject());
  }

  async createMentalHealthResource(resource) {
    await this.ensureConnection();
    const mentalHealthResource = new this.MentalHealthResource(resource);
    await mentalHealthResource.save();
    return mentalHealthResource.toObject();
  }

  // Reminder operations
  async createReminder(reminderData) {
    await this.ensureConnection();
    try {
      const reminder = new this.Reminder({
        ...reminderData,
        createdAt: new Date()
      });
      await reminder.save();
      return reminder.toObject();
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async getRemindersByAppointment(appointmentId) {
    await this.ensureConnection();
    try {
      const reminders = await this.Reminder.find({ appointmentId });
      return reminders.map(reminder => reminder.toObject());
    } catch (error) {
      console.error('Error getting reminders by appointment:', error);
      return [];
    }
  }

  async getPendingReminders() {
    await this.ensureConnection();
    try {
      const reminders = await this.Reminder.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      });
      return reminders.map(reminder => reminder.toObject());
    } catch (error) {
      console.error('Error getting pending reminders:', error);
      return [];
    }
  }

  async updateReminderStatus(id, status, response) {
    await this.ensureConnection();
    const update = { status };
    if (response) {
      update.response = response;
    }
    const reminder = await this.Reminder.findByIdAndUpdate(id, update, { new: true });
    return reminder ? reminder.toObject() : undefined;
  }

  // Saved Hospitals operations
  async getSavedHospitals(userId) {
    await this.ensureConnection();
    const user = await this.User.findById(userId).populate('savedHospitals');
    return user ? user.savedHospitals.map(hospital => hospital.toObject()) : [];
  }

  async saveHospital(userId, hospitalId) {
    await this.ensureConnection();
    const user = await User.findById(userId);
    if (!user) return false;
    
    if (!user.savedHospitals.includes(hospitalId)) {
      user.savedHospitals.push(hospitalId);
      await user.save();
    }
    return true;
  }

  async removeSavedHospital(userId, hospitalId) {
    await this.ensureConnection();
    const user = await User.findById(userId);
    if (!user) return false;
    
    user.savedHospitals = user.savedHospitals.filter(id => id.toString() !== hospitalId);
    await user.save();
    return true;
  }

  // Search operations
  async searchHospitals(query, latitude, longitude, radius = 10) {
    await this.ensureConnection();
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } }
      ];
    }
    
    const hospitals = await Hospital.find(searchQuery);
    
    if (latitude && longitude) {
      return hospitals
        .map(hospital => hospital.toObject())
        .filter(hospital => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            hospital.latitude,
            hospital.longitude
          );
          return distance <= radius;
        })
        .sort((a, b) => {
          const distanceA = this.calculateDistance(
            latitude,
            longitude,
            a.latitude,
            a.longitude
          );
          const distanceB = this.calculateDistance(
            latitude,
            longitude,
            b.latitude,
            b.longitude
          );
          return distanceA - distanceB;
        });
    }
    
    return hospitals.map(hospital => hospital.toObject());
  }

  async getNearbyHospitals(latitude, longitude, radius = 10) {
    await this.ensureConnection();
    const hospitals = await Hospital.find();
    
    return hospitals
      .map(hospital => hospital.toObject())
      .filter(hospital => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );
        return distance <= radius;
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(
          latitude,
          longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = this.calculateDistance(
          latitude,
          longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });
  }

  async getHospitalsBySpecialtyWithLocation(specialty, latitude, longitude, radius = 10) {
    await this.ensureConnection();
    const hospitals = await Hospital.find({
      specialties: { $regex: specialty, $options: 'i' }
    });
    
    return hospitals
      .map(hospital => hospital.toObject())
      .filter(hospital => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );
        return distance <= radius;
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(
          latitude,
          longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = this.calculateDistance(
          latitude,
          longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Doctor specific operations
  async getDoctorNotifications(doctorId) {
    await this.ensureConnection();
    try {
      const notifications = await this.Notification.find({ doctorId })
        .sort({ createdAt: -1 });
      return notifications.map(notification => notification.toObject());
    } catch (error) {
      console.error('Error getting doctor notifications:', error);
      return [];
    }
  }

  async getDoctorMedicalRecords(doctorId) {
    await this.ensureConnection();
    try {
      const records = await this.MedicalRecord.find({ doctorId })
        .populate('patientId', 'name email')
        .sort({ date: -1 });
      return records.map(record => record.toObject());
    } catch (error) {
      console.error('Error getting doctor medical records:', error);
      return [];
    }
  }

  async getDoctorSchedule(doctorId) {
    await this.ensureConnection();
    try {
      const schedules = await this.Schedule.find({ doctorId })
        .populate('hospitalId', 'name address phone email')
        .sort({ dayOfWeek: 1 });
      return schedules.map(schedule => schedule.toObject());
    } catch (error) {
      console.error('Error getting doctor schedule:', error);
      throw error;
    }
  }

  async cleanupOrphanedSchedules() {
    await this.ensureConnection();
    try {
      // Find all schedules
      const schedules = await this.Schedule.find();
      let cleanedCount = 0;

      for (const schedule of schedules) {
        // Check if doctor exists
        const doctor = await this.Doctor.findById(schedule.doctorId);
        if (!doctor) {
          console.log('Removing orphaned schedule:', schedule._id);
          await this.Schedule.findByIdAndDelete(schedule._id);
          cleanedCount++;
          continue;
        }

        // Check if hospital exists
        const hospital = await this.Hospital.findById(schedule.hospitalId);
        if (!hospital) {
          console.log('Removing orphaned schedule:', schedule._id);
          await this.Schedule.findByIdAndDelete(schedule._id);
          cleanedCount++;
        }
      }

      console.log(`Cleaned up ${cleanedCount} orphaned schedules`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up orphaned schedules:', error);
      throw error;
    }
  }

  async getSchedulesByHospital(hospitalId) {
    await this.ensureConnection();
    try {
      // Validate hospitalId
      if (!hospitalId) {
        console.error('Invalid hospitalId provided:', hospitalId);
        return [];
      }

      console.log('Looking for schedules with hospitalId:', hospitalId);
      
      // First verify the hospital exists
      const hospital = await this.Hospital.findById(hospitalId);
      if (!hospital) {
        console.error('Hospital not found:', hospitalId);
        return [];
      }
      
      // Find all schedules for this hospital without populating doctor yet
      const schedules = await this.Schedule.find({ hospitalId })
        .sort({ dayOfWeek: 1 });
      
      console.log(`Found ${schedules.length} schedules for hospital ${hospitalId}`);
      
      // Check for orphaned schedules and remove them
      const validSchedules = [];
      for (const schedule of schedules) {
        // Check if doctor exists directly to avoid populate issues
        const doctor = await this.Doctor.findById(schedule.doctorId);
        if (!doctor) {
          console.log(`Removing orphaned schedule with missing doctor: ${schedule._id}, doctorId: ${schedule.doctorId}`);
          await this.Schedule.findByIdAndDelete(schedule._id);
          continue;
        }
        validSchedules.push(schedule);
      }
      
      // Now that we've cleaned up, populate the doctor info for valid schedules
      const populatedSchedules = [];
      for (const schedule of validSchedules) {
        const populatedSchedule = await this.Schedule.findById(schedule._id)
          .populate('doctorId', 'name specialization email phone profilePicture');
        if (populatedSchedule) {
          populatedSchedules.push(populatedSchedule);
        }
      }
      
      // Group schedules by doctor
      const doctorSchedules = {};
      let skippedSchedules = 0;
      
      for (const schedule of populatedSchedules) {
        const doctor = schedule.doctorId;
        if (!doctor || !doctor._id) {
          console.log('Skipping schedule with missing doctor:', schedule._id);
          skippedSchedules++;
          continue;
        }
        
        if (!doctorSchedules[doctor._id]) {
          doctorSchedules[doctor._id] = {
            doctor: doctor,
            schedules: []
          };
        }
        
        doctorSchedules[doctor._id].schedules.push({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          breakStart: schedule.breakStart,
          breakEnd: schedule.breakEnd,
          appointmentDuration: schedule.appointmentDuration,
          isAvailable: schedule.isAvailable
        });
      }
      
      const result = Object.values(doctorSchedules);
      console.log(`Returning ${result.length} doctor schedules (${skippedSchedules} schedules skipped due to missing doctors)`);
      return result;
    } catch (error) {
      console.error('Error getting hospital schedules:', error);
      throw error;
    }
  }

  async updateDoctorSchedule(doctorId, scheduleData) {
    await this.ensureConnection();
    try {
      console.log('🔄 Starting updateDoctorSchedule with:', { doctorId, scheduleData });

      // First verify the doctor exists
      console.log('🔍 Verifying doctor exists with ID:', doctorId);
      const doctor = await this.Doctor.findById(doctorId);
      if (!doctor) {
        console.error('❌ Doctor not found with ID:', doctorId);
        throw new Error('Doctor not found');
      }
      console.log('✅ Doctor found:', doctor.name || doctor._id);

      // Verify the hospital exists
      console.log('🔍 Verifying hospital exists with ID:', scheduleData.hospitalId);
      const hospital = await this.Hospital.findById(scheduleData.hospitalId);
      if (!hospital) {
        console.error('❌ Hospital not found with ID:', scheduleData.hospitalId);
        throw new Error('Hospital not found');
      }
      console.log('✅ Hospital found:', hospital.name || hospital._id);

      // Check for existing schedule
      console.log('🔍 Checking for existing schedule with filter:', { 
        doctorId,
        hospitalId: scheduleData.hospitalId,
        dayOfWeek: scheduleData.dayOfWeek 
      });
      const existingSchedule = await this.Schedule.findOne({ 
        doctorId,
        hospitalId: scheduleData.hospitalId,
        dayOfWeek: scheduleData.dayOfWeek 
      });
      
      if (existingSchedule) {
        console.log('ℹ️ Found existing schedule:', existingSchedule._id);
      } else {
        console.log('ℹ️ No existing schedule found, will create new one');
      }

      // Create or update the schedule
      console.log('📝 Creating/updating schedule with data:', {
        ...scheduleData,
        doctorId,
        hospitalId: scheduleData.hospitalId
      });
      
      const schedule = await this.Schedule.findOneAndUpdate(
        { 
          doctorId,
          hospitalId: scheduleData.hospitalId,
          dayOfWeek: scheduleData.dayOfWeek 
        },
        {
          ...scheduleData,
          doctorId,
          hospitalId: scheduleData.hospitalId
        },
        { upsert: true, new: true }
      );

      console.log('✅ Schedule saved successfully:', schedule);
      console.log('📊 Schedule ID:', schedule._id);
      console.log('📊 Schedule dayOfWeek:', schedule.dayOfWeek);
      console.log('📊 Schedule times:', schedule.startTime, '-', schedule.endTime);

      // Update the hospital's doctors array if not already included
      console.log('🔄 Updating hospital doctors array');
      await this.Hospital.findByIdAndUpdate(
        scheduleData.hospitalId,
        { $addToSet: { doctors: doctorId } }
      );
      console.log('✅ Hospital doctors array updated');

      // Verify schedule exists in database after save
      const verifySchedule = await this.Schedule.findById(schedule._id);
      if (verifySchedule) {
        console.log('✅ Verified schedule exists in database after save');
      } else {
        console.warn('⚠️ Warning: Could not verify schedule in database after save');
      }

      // Count total schedules for this doctor
      const totalSchedules = await this.Schedule.countDocuments({ doctorId });
      console.log(`📊 Total schedules for doctor: ${totalSchedules}`);

      return schedule;
    } catch (error) {
      console.error('❌ Error updating doctor schedule:', error);
      throw error;
    }
  }

  async getDoctorByUserId(userId) {
    await this.ensureConnection();
    try {
      console.log('🔍 Searching for doctor with userId:', userId);
      
      // DIRECT LOOKUP: First try looking for the doctor by their ID if the ID passed is the doctor ID
      // This handles the case when the userId is actually the doctor's document ID
      try {
        // Check if the userId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const doctorById = await this.Doctor.findById(userId);
          if (doctorById) {
            console.log(`✅ Found doctor directly by ID: ${userId}`);
            return doctorById;
          }
        }
      } catch (directLookupError) {
        console.log('Direct ID lookup failed:', directLookupError.message);
      }
      
      // SPECIAL CASE: Handle the specific known issue with user ID
      if (userId === '683241c8f7be89bf929b0c6d' || userId === '683241c8f7be89bf929b0c6f') {
        console.log('🔄 Special case in getDoctorByUserId: Using doctor ID 683241c8f7be89bf929b0c6f');
        try {
          const doctor = await this.Doctor.findById('683241c8f7be89bf929b0c6f');
          if (doctor) {
            console.log('✅ Found doctor by direct ID: 683241c8f7be89bf929b0c6f');
            
            // Update the doctor with the userId if not already set
            if (!doctor.userId) {
              await this.Doctor.updateOne(
                { _id: doctor._id },
                { $set: { userId: '683241c8f7be89bf929b0c6f' } },
                { runValidators: false }
              );
              console.log('✅ Updated doctor with userId');
            }
            
            return doctor;
          }
        } catch (specialCaseError) {
          console.log('Special case lookup failed:', specialCaseError.message);
        }
      }
      
      // Check if userId is valid
      if (!userId) {
        console.error('❌ Invalid userId provided:', userId);
        return null;
      }
      
      // First check the schema to confirm how doctors are stored
      const doctorSchema = this.Doctor.schema.obj;
      console.log('📚 Doctor schema:', JSON.stringify(doctorSchema, null, 2));
      
      // Check if any doctors exist at all
      const totalDoctors = await this.Doctor.countDocuments();
      console.log(`📊 Total doctors in database: ${totalDoctors}`);
      
      if (totalDoctors === 0) {
        console.log('⚠️ Warning: No doctors found in the database at all');
      }
      
      // Find the doctor by userId
      const doctor = await this.Doctor.findOne({ userId });
      
      if (doctor) {
        console.log('✅ Doctor found with userId:', userId);
        console.log('💻 Doctor data:', doctor._id, doctor.name || 'No name');
        return doctor.toObject();
      } else {
        // If not found, let's try to find what doctors do exist
        console.error('❌ No doctor found with userId:', userId);
        
        // Get a sample of doctors to debug
        const sampleDoctors = await this.Doctor.find().limit(3);
        console.log('🔍 Sample doctors in database:', 
          sampleDoctors.map(d => ({ 
            _id: d._id, 
            userId: d.userId, 
            name: d.name || 'No name' 
          }))
        );
        
        // Try to find the user to make sure it exists
        const user = await this.User.findById(userId);
        if (user) {
          console.log('✅ User exists:', user._id, user.username);
          console.log('🔍 User role:', user.role);
          
          // If user exists but no doctor profile, we might need to create one
          if (user.role === 'doctor') {
            console.log('⚠️ User has doctor role but no doctor profile');
          }
        } else {
          console.error('❌ User not found with ID:', userId);
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting doctor by user ID:', error);
      return null;
    }
  }
  
  // Methods for follow-up reminder system
  async getCompletedAppointmentsForFollowUp() {
    await this.ensureConnection();
    try {
      // Get appointments that:
      // 1. Are completed (status = 'completed')
      // 2. Happened in the last 7 days
      // 3. Haven't had a follow-up reminder sent yet (followUpReminderSent = false or undefined)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const appointments = await this.Appointment.find({
        status: 'completed',
        date: { $gte: sevenDaysAgo },
        $or: [
          { followUpReminderSent: { $exists: false } },
          { followUpReminderSent: false }
        ]
      }).sort({ date: 1 });
      
      return appointments;
    } catch (error) {
      console.error('Error getting completed appointments for follow-up:', error);
      return [];
    }
  }
  
  async getFollowUpAppointment(originalAppointmentId) {
    await this.ensureConnection();
    try {
      // Find an appointment that references the original as a follow-up
      const followUp = await this.Appointment.findOne({
        originalAppointmentId: originalAppointmentId,
        status: { $in: ['scheduled', 'confirmed', 'pending'] }
      });
      
      return followUp;
    } catch (error) {
      console.error('Error getting follow-up appointment:', error);
      return null;
    }
  }
  
  async markFollowUpSent(appointmentId) {
    await this.ensureConnection();
    try {
      // Mark that we've sent a follow-up reminder for this appointment
      await this.Appointment.findByIdAndUpdate(appointmentId, {
        followUpReminderSent: true
      });
      
      return true;
    } catch (error) {
      console.error('Error marking follow-up reminder as sent:', error);
      return false;
    }
  }

  // Notification methods
  async createNotification(notification) {
    await this.ensureConnection();
    try {
      const newNotification = new this.Notification(notification);
      await newNotification.save();
      return newNotification.toObject();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId) {
    await this.ensureConnection();
    try {
      const notifications = await this.Notification.find({ userId })
        .sort({ createdAt: -1 })
        .select('-__v');
      return notifications.map(notification => notification.toObject());
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId, userId) {
    await this.ensureConnection();
    try {
      const notification = await this.Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { read: true } },
        { new: true }
      );
      return notification ? notification.toObject() : null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId) {
    await this.ensureConnection();
    try {
      await this.Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    await this.ensureConnection();
    try {
      const result = await this.Notification.deleteOne({ _id: notificationId, userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async deleteAllNotifications(userId) {
    await this.ensureConnection();
    try {
      await this.Notification.deleteMany({ userId });
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  async getUpcomingAppointments() {
    await this.ensureConnection();
    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const appointments = await this.Appointment.find({
        date: {
          $gte: now,
          $lte: twentyFourHoursFromNow
        },
        status: 'confirmed'
      }).populate('patientId doctorId hospitalId');

      return appointments.map(appointment => appointment.toObject());
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      return [];
    }
  }
}

module.exports = { MongoStorage };