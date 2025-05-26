const twilio = require("twilio");
const nodemailer = require("nodemailer");
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

// Create nodemailer transporter
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('Email transporter initialized successfully');
  } catch (error) {
    console.warn("Failed to initialize email transporter:", error.message);
  }
} else {
  console.warn("Email credentials not found. Email notifications will be disabled.");
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
  if (!emailTransporter) {
    console.warn("Email transporter not initialized. Email notifications are disabled.");
    return false;
  }

  try {
    const result = await emailTransporter.sendMail({
      to: email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject,
      text: message,
      html: message.replace(/\n/g, "<br>")
    });
    console.log('Email sent successfully:', result.messageId);
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
        
        // Send follow-up reminder to patient via email
        if (patient.email) {
          const patientSubject = `Follow-up for your appointment on ${appointmentDetails.appointmentDate}`;
          const patientMessage = `
            <h2>Appointment Follow-up</h2>
            <p>Hello ${appointmentDetails.patientName},</p>
            <p>We're following up on your recent appointment with Dr. ${appointmentDetails.doctorName} on ${appointmentDetails.appointmentDate}.</p>
            ${appointmentDetails.customMessage ? `<p>${appointmentDetails.customMessage}</p>` : ''}
            ${appointmentDetails.followUpNeeded ? `
              <p><strong>Important:</strong> A follow-up appointment has been scheduled for you on ${appointmentDetails.followUpDate}.</p>
              <p>Please make sure this date works for you. If not, contact us to reschedule.</p>
            ` : ''}            
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
            <p>Thank you for choosing Health AI Companion for your healthcare needs.</p>
            <p>Best regards,<br>Health AI Companion Team</p>
          `;
          
          await sendEmail(patient.email, patientSubject, patientMessage);
          
          // Mark as follow-up sent
          await this.storage.markFollowUpSent(appointment._id);
          
          console.log(`Sent email follow-up reminder for appointment: ${appointment._id} to ${patient.email}`);
        }
        
        // Notify doctor about the follow-up via email
        if (doctor.email) {
          const doctorSubject = `Follow-up sent: ${patient.name}'s appointment on ${appointmentDetails.appointmentDate}`;
          const doctorMessage = `
            <h2>Follow-up Notification</h2>
            <p>Hello Dr. ${appointmentDetails.doctorName},</p>
            <p>A follow-up reminder has been sent to ${patient.name} regarding their appointment on ${appointmentDetails.appointmentDate}.</p>
            ${appointmentDetails.followUpNeeded ? `
              <p>They have been reminded of their follow-up appointment scheduled for ${appointmentDetails.followUpDate}.</p>
            ` : '<p>No follow-up appointment has been scheduled.</p>'}
            <p>Thank you,<br>Health AI Companion Team</p>
          `;
          
          await sendEmail(doctor.email, doctorSubject, doctorMessage);
          
          console.log(`Sent email follow-up notification to doctor: ${doctor.email}`);
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

      // Get time description for reminder
      const timeDescription = reminderType === '24-hour' ? '24 hours' : 
                             reminderType === '2-hour' ? '2 hours' : '1 hour';

      // Send reminder to patient via email
      if (patient.email) {
        const patientSubject = `Appointment Reminder: Your appointment is in ${timeDescription}`;
        const patientMessage = `
          <h2>Appointment Reminder</h2>
          <p>Hello ${appointmentDetails.patientName},</p>
          <p>This is a reminder that you have an appointment in <strong>${timeDescription}</strong>.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
            <li><strong>Date:</strong> ${appointmentDetails.date}</li>
            <li><strong>Time:</strong> ${appointmentDetails.time}</li>
            <li><strong>Location:</strong> ${appointmentDetails.hospitalName}</li>
            <li><strong>Reason:</strong> ${appointmentDetails.reason}</li>
          </ul>
          <p>Please arrive 15 minutes early to complete any necessary paperwork.</p>
          <p>If you need to reschedule, please contact us as soon as possible.</p>
          <p>Thank you,<br>Health AI Companion Team</p>
        `;
        
        await sendEmail(patient.email, patientSubject, patientMessage);
        console.log(`Sent email reminder to patient: ${patient.email}`);
      }

      // Send reminder to doctor via email
      if (doctor.email) {
        const doctorSubject = `Upcoming Appointment Reminder: ${appointmentDetails.patientName} in ${timeDescription}`;
        const doctorMessage = `
          <h2>Appointment Reminder</h2>
          <p>Hello Dr. ${appointmentDetails.doctorName},</p>
          <p>This is a reminder that you have an appointment in <strong>${timeDescription}</strong>.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Patient:</strong> ${appointmentDetails.patientName}</li>
            <li><strong>Date:</strong> ${appointmentDetails.date}</li>
            <li><strong>Time:</strong> ${appointmentDetails.time}</li>
            <li><strong>Location:</strong> ${appointmentDetails.hospitalName}</li>
            <li><strong>Reason:</strong> ${appointmentDetails.reason}</li>
          </ul>
          <p>Thank you,<br>Health AI Companion Team</p>
        `;
        
        await sendEmail(doctor.email, doctorSubject, doctorMessage);
        console.log(`Sent email reminder to doctor: ${doctor.email}`);
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