import { IStorage } from "../storage";
import { Reminder } from "@shared/schema";
import twilio from "twilio";
import sgMail from "@sendgrid/mail";

// Initialize messaging clients
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendSMS(phone: string, message: string): Promise<boolean> {
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

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
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

async function sendEmail(email: string, subject: string, message: string): Promise<boolean> {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
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

async function processReminder(reminder: Reminder, storage: IStorage) {
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

export function startReminderWorker(storage: IStorage) {
  console.log("Starting reminder worker...");
  
  // Check for pending reminders every minute
  setInterval(async () => {
    try {
      const pendingReminders = await storage.getPendingReminders();
      
      for (const reminder of pendingReminders) {
        // Update reminder status to sent
        await storage.updateReminderStatus(reminder.id, "sent");
        
        // Here you would integrate with your SMS/WhatsApp service
        console.log(`Sending reminder for appointment ${reminder.appointmentId}`);
      }
    } catch (error) {
      console.error("Error processing reminders:", error);
    }
  }, 60000); // Check every minute
} 