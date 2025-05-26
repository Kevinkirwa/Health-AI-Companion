import { Appointment, IAppointment } from '../models/Appointment';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Hospital } from '../models/Hospital';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Initialize Twilio client for SMS
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export class ReminderService {
  // Send reminder for a single appointment
  static async sendReminder(appointment: IAppointment): Promise<boolean> {
    try {
      // Get patient, doctor, and hospital details
      const [patient, doctor, hospital] = await Promise.all([
        User.findById(appointment.patientId),
        Doctor.findById(appointment.doctorId),
        Hospital.findById(appointment.hospitalId)
      ]);

      if (!patient || !doctor || !hospital) {
        throw new Error('Required data not found');
      }

      const appointmentDate = new Date(appointment.date);
      const formattedDate = format(appointmentDate, 'MMMM do, yyyy');
      const formattedTime = appointment.time;

      // Prepare message content
      const message = `Reminder: You have an appointment with Dr. ${doctor.name} at ${hospital.name} on ${formattedDate} at ${formattedTime}. Type: ${appointment.type}`;

      // Send reminder based on preferred channel
      switch (appointment.reminderChannel) {
        case 'sms':
          await this.sendSMS(patient.phone, message);
          break;
        case 'whatsapp':
          await this.sendWhatsApp(patient.phone, message);
          break;
        case 'email':
          await this.sendEmail(patient.email, 'Appointment Reminder', message);
          break;
      }

      // Update appointment reminder status
      await Appointment.findByIdAndUpdate(appointment._id, {
        reminderSent: true,
        reminderStatus: 'sent'
      });

      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      
      // Update appointment reminder status to failed
      await Appointment.findByIdAndUpdate(appointment._id, {
        reminderStatus: 'failed'
      });

      return false;
    }
  }

  // Process all pending reminders
  static async processPendingReminders(): Promise<void> {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find all appointments that need reminders
      const appointments = await Appointment.find({
        date: { $gte: now, $lte: oneDayFromNow },
        status: 'scheduled',
        reminderSent: false,
        reminderStatus: 'pending'
      });

      // Send reminders for each appointment
      for (const appointment of appointments) {
        await this.sendReminder(appointment);
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  // Send SMS using Twilio
  private static async sendSMS(phone: string, message: string): Promise<void> {
    try {
      await twilioClient.messages.create({
        body: message,
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Send WhatsApp message using Twilio
  private static async sendWhatsApp(phone: string, message: string): Promise<void> {
    try {
      await twilioClient.messages.create({
        body: message,
        to: `whatsapp:${phone}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Send email using Nodemailer
  private static async sendEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: subject,
        text: message
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
} 