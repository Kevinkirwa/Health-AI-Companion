import { Reminder } from '../models/Reminder';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { sendSMS } from '../utils/sms';
import { sendAppointmentReminderEmail } from '../utils/appointment-notifications';

export class NotificationService {
  // Create reminders for an appointment
  static async createAppointmentReminders(appointment: any, preferences: any) {
    try {
      const { userId, doctorId, date, time } = appointment;
      const appointmentDateTime = new Date(`${date}T${time}`);
      
      // Get user and doctor details
      const [user, doctor] = await Promise.all([
        User.findById(userId),
        Doctor.findById(doctorId)
      ]);

      if (!user || !doctor) {
        throw new Error('User or doctor not found');
      }

      // Default intervals: 24 hours and 1 hour before appointment
      const intervals = preferences?.intervals || [24, 1];
      
      const reminders = await Promise.all(intervals.map(async (hours: number) => {
        const scheduledFor = new Date(appointmentDateTime.getTime() - (hours * 60 * 60 * 1000));
                // Create reminder for patient
        const patientReminder = new Reminder({
          appointmentId: appointment._id,
          userId,
          doctorId,
          type: 'email',  // Changed from 'whatsapp' to 'email'
          scheduledFor,
          notificationPreferences: {
            sms: (user as any).preferences?.notificationChannels?.sms || false,
            email: (user as any).preferences?.notificationChannels?.email || true  // Use email instead of WhatsApp
          },
          intervals,
          message: `Reminder: You have an appointment with Dr. ${doctor.name} in ${hours} hour(s)`
        });

        // Create reminder for doctor
        const doctorReminder = new Reminder({
          appointmentId: appointment._id,
          userId: doctorId,
          doctorId,
          type: 'email',  // Changed from 'whatsapp' to 'email'
          scheduledFor,
          notificationPreferences: {
            sms: (doctor as any).notificationPreferences?.sms || false,
            email: (doctor as any).notificationPreferences?.email || true  // Use email instead of WhatsApp
          },
          intervals,
          message: `Reminder: You have an appointment with patient ${user.name} in ${hours} hour(s)`
        });

        return [patientReminder, doctorReminder];
      }));

      // Flatten the array of reminders
      const flattenedReminders = reminders.flat();
      await Reminder.insertMany(flattenedReminders);
      console.log(`Created ${flattenedReminders.length} reminders for appointment ${appointment._id}`);
    } catch (error) {
      console.error('Error creating appointment reminders:', error);
      throw error;
    }
  }

  // Process pending reminders
  static async processPendingReminders() {
    try {
      const now = new Date();
      const pendingReminders = await Reminder.find({
        scheduledFor: { $lte: now },
        status: 'pending'
      }).populate('userId doctorId appointmentId');

      console.log(`Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          const user = reminder.userId as any;
          const doctor = reminder.doctorId as any;
          const appointment = reminder.appointmentId as any;

          if (!user || !doctor || !appointment) {
            console.warn('Missing required data for reminder:', reminder._id);
            continue;
          }

          // Send notifications based on preferences
          const notificationPromises = [];

          if (reminder.notificationPreferences.sms) {
            const phoneNumber = user.role === 'doctor' ? user.phone : user.phone;
            if (phoneNumber) {
              notificationPromises.push(
                this.sendSMSNotification(user, doctor, appointment, reminder)
                  .catch(error => console.error('SMS notification failed:', error))
              );
            }
          }

          if (reminder.notificationPreferences.email) {
            const email = user.role === 'doctor' ? user.email : user.email;
            if (email) {
              notificationPromises.push(
                this.sendEmailNotification(user, doctor, appointment, reminder)
                  .catch(error => console.error('Email notification failed:', error))
              );
            }
          }

          // Wait for all notifications to be sent
          await Promise.all(notificationPromises);

          // Update reminder status
          reminder.status = 'sent';
          reminder.sentAt = new Date();
          await reminder.save();

          console.log(`Successfully processed reminder ${reminder._id}`);
        } catch (error) {
          console.error('Error processing reminder:', error);
          reminder.status = 'failed';
          reminder.response = error instanceof Error ? error.message : String(error);
          await reminder.save();
        }
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
      throw error;
    }
  }

  // Send SMS notification
  private static async sendSMSNotification(user: any, doctor: any, appointment: any, reminder: any) {
    const message = `Reminder: Appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.time}. ${reminder.message}`;
    const phoneNumber = user.role === 'doctor' ? user.phone : user.phone;
    await sendSMS(phoneNumber, message);
  }

  // Send Email notification
  private static async sendEmailNotification(user: any, doctor: any, appointment: any, reminder: any) {
    await sendAppointmentReminderEmail(user, doctor, appointment, reminder);
  }

  // Get user's upcoming reminders
  static async getUserReminders(userId: string) {
    try {
      return await Reminder.find({
        userId,
        scheduledFor: { $gte: new Date() },
        status: 'pending'
      }).populate('doctorId appointmentId');
    } catch (error) {
      console.error('Error getting user reminders:', error);
      throw error;
    }
  }

  // Get doctor's upcoming reminders
  static async getDoctorReminders(doctorId: string) {
    try {
      return await Reminder.find({
        doctorId,
        scheduledFor: { $gte: new Date() },
        status: 'pending'
      }).populate('userId appointmentId');
    } catch (error) {
      console.error('Error getting doctor reminders:', error);
      throw error;
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const result = await Reminder.updateMany(
        { userId, status: 'pending' },
        { $set: { notificationPreferences: preferences } }
      );
      console.log(`Updated notification preferences for user ${userId}:`, result);
      return result;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
} 