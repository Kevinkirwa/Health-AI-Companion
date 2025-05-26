const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");
const twilioService = require('../services/twilio');
const { MongoStorage } = require('../storage/mongodb');

// Initialize messaging clients conditionally
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.warn("Failed to initialize Twilio client:", error.message);
  }
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SendGrid API key not found. Email notifications will be disabled.");
}

async function sendSMS(phone, message) {
  if (!twilioClient) {
    console.warn("Twilio client not initialized. SMS notifications are disabled.");
    return false;
  }

  try {
    // Format phone number for Kenya (add +254 if not present)
    const formattedPhone = phone.startsWith("+") ? phone : `+254${phone.replace(/^0+/, "")}`;
    
    await twilioClient.messages.create({
      body: message,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

async function sendWhatsApp(phone, message) {
  if (!twilioClient) {
    console.warn("Twilio client not initialized. WhatsApp notifications are disabled.");
    return false;
  }

  try {
    // Format phone number for Kenya (add +254 if not present)
    const formattedPhone = phone.startsWith("+") ? phone : `+254${phone.replace(/^0+/, "")}`;
    
    await twilioClient.messages.create({
      body: message,
      to: `whatsapp:${formattedPhone}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    });
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
}

async function sendEmail(email, subject, message) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key not found. Email notifications are disabled.");
    return false;
  }

  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text: message,
      html: message.replace(/\n/g, "<br>")
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

async function processReminder(reminder, storage) {
  try {
    // Get appointment details
    const appointment = await storage.getAppointment(reminder.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Get user and doctor details
    const user = await storage.getUser(appointment.userId);
    const doctor = await storage.getDoctor(appointment.doctorId);
    if (!user || !doctor) {
      throw new Error("User or doctor not found");
    }

    // Construct reminder message
    const message = `Reminder: You have an appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.time}.\n\n` +
      `Please reply with:\n` +
      `"YES" to confirm\n` +
      `"NO" to cancel\n` +
      `"RESCHEDULE" to request a new time`;

    let success = false;

    // Send notification based on type
    switch (reminder.type) {
      case "sms":
        success = await sendSMS(user.phone || "", message);
        break;
      case "whatsapp":
        success = await sendWhatsApp(user.phone || "", message);
        break;
      case "email":
        success = await sendEmail(user.email, "Appointment Reminder", message);
        break;
      default:
        console.warn(`Unknown reminder type: ${reminder.type}`);
        success = false;
    }

    // Update reminder status
    if (success) {
      await storage.updateReminderStatus(reminder.id, "sent");
    } else {
      await storage.updateReminderStatus(reminder.id, "failed");
    }
  } catch (error) {
    console.error("Error processing reminder:", error);
    await storage.updateReminderStatus(reminder.id, "failed");
  }
}

class ReminderWorker {
  constructor(storage) {
    this.storage = storage;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('Reminder worker started');

    // Run every minute
    setInterval(async () => {
      try {
        await this.checkAndSendReminders();
      } catch (error) {
        console.error('Error in reminder worker:', error);
      }
    }, 60000); // 60000 ms = 1 minute
  }

  async checkAndSendReminders() {
    try {
      // Get all upcoming appointments in the next 24 hours
      const appointments = await this.storage.getUpcomingAppointments();
      
      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.date);
        const now = new Date();
        const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

        // Send reminders at different intervals
        if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 23) {
          // Send 24-hour reminder
          await this.sendReminders(appointment, '24-hour');
        } else if (hoursUntilAppointment <= 2 && hoursUntilAppointment > 1) {
          // Send 2-hour reminder
          await this.sendReminders(appointment, '2-hour');
        } else if (hoursUntilAppointment <= 1 && hoursUntilAppointment > 0) {
          // Send 1-hour reminder
          await this.sendReminders(appointment, '1-hour');
        }
      }

      // Check for appointments that need follow-ups
      await this.checkAndSendFollowUps();
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async checkAndSendFollowUps() {
    try {
      // Get completed appointments from the past 7 days that haven't had follow-ups sent
      const completedAppointments = await this.storage.getCompletedAppointmentsForFollowUp();
      
      for (const appointment of completedAppointments) {
        // Get patient and doctor details
        const patient = await this.storage.getUser(appointment.patientId);
        const doctor = await this.storage.getDoctor(appointment.doctorId);
        
        if (!patient || !doctor) {
          console.error('Missing user data for follow-up:', appointment._id);
          continue;
        }
        
        // Get follow-up details if a follow-up was scheduled
        const followUpAppointment = await this.storage.getFollowUpAppointment(appointment._id);
        
        // Check if appointment has notes or prescriptions to mention
        const appointmentDetails = {
          patientName: patient.name,
          doctorName: doctor.name,
          appointmentDate: new Date(appointment.date).toLocaleDateString(),
          followUpNeeded: !!followUpAppointment,
          followUpDate: followUpAppointment ? new Date(followUpAppointment.date).toLocaleDateString() : null,
          customMessage: appointment.notes
            ? `Dr. ${doctor.name}'s notes: ${appointment.notes.slice(0, 100)}${appointment.notes.length > 100 ? '...' : ''}`
            : null
        };
        
        // Send follow-up reminder to patient
        if (patient.phone) {
          await twilioService.sendFollowUpReminder(patient.phone, appointmentDetails);
          
          // Mark as follow-up sent
          await this.storage.markFollowUpSent(appointment._id);
          
          console.log(`Sent follow-up reminder for appointment: ${appointment._id}`);
        }
        
        // Notify doctor about the follow-up
        if (doctor.phone) {
          const doctorMessage = `A follow-up reminder has been sent to ${patient.name} regarding their appointment on ${appointmentDetails.appointmentDate}.`;
          
          await twilioService.sendDoctorNotification(doctor.phone, {
            doctorName: doctor.name,
            message: doctorMessage,
            date: appointmentDetails.appointmentDate,
            time: new Date(appointment.date).toLocaleTimeString(),
            hospitalName: 'Your Hospital' // This should be fetched from appointment details
          });
        }
      }
    } catch (error) {
      console.error('Error sending follow-ups:', error);
    }
  }

  async sendReminders(appointment, reminderType) {
    try {
      // Get patient and doctor details
      const patient = await this.storage.getUser(appointment.patientId);
      const doctor = await this.storage.getDoctor(appointment.doctorId);
      const hospital = await this.storage.getHospital(appointment.hospitalId);

      if (!patient || !doctor || !hospital) {
        console.error('Missing user data for appointment:', appointment._id);
        return;
      }

      // Format appointment details
      const appointmentDetails = {
        patientName: patient.name,
        doctorName: doctor.name,
        hospitalName: hospital.name,
        date: new Date(appointment.date).toLocaleDateString(),
        time: new Date(appointment.date).toLocaleTimeString(),
        reason: appointment.reason || 'Not specified'
      };

      // Send reminder to patient
      if (patient.phone) {
        await twilioService.sendAppointmentReminder(patient.phone, {
          ...appointmentDetails,
          reminderType
        });
      }

      // Send reminder to doctor
      if (doctor.phone) {
        await twilioService.sendDoctorNotification(doctor.phone, {
          doctorName: doctor.name,
          message: `Reminder: You have an appointment in ${reminderType === '24-hour' ? '24 hours' : reminderType === '2-hour' ? '2 hours' : '1 hour'}`,
          date: appointmentDetails.date,
          time: appointmentDetails.time,
          hospitalName: hospital.name
        });
      }

      // Save reminder records
      await this.storage.createReminder({
        appointmentId: appointment._id,
        patientId: patient._id,
        doctorId: doctor._id,
        type: reminderType,
        status: 'sent',
        sentAt: new Date()
      });

      console.log(`Sent ${reminderType} reminders for appointment:`, appointment._id);
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  }
}

function startReminderWorker(storage) {
  const worker = new ReminderWorker(storage);
  worker.start();
}

module.exports = { startReminderWorker };