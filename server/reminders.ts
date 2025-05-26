import { IStorage } from "./storage";
import { Reminder } from "@shared/schema";
import { sendWhatsApp } from "./utils/whatsapp";
import { sendSMS } from "./utils/sms";
import { sendEmail } from "./utils/email";

export function startReminderWorker(storage: IStorage) {
  console.log("Starting reminder worker...");
  
  // Check for pending reminders every minute
  setInterval(async () => {
    try {
      const pendingReminders = await storage.getPendingReminders();
      
      for (const reminder of pendingReminders) {
        try {
          // Get appointment details
          const appointment = await storage.getAppointment(reminder.appointmentId);
          if (!appointment) {
            console.warn(`Appointment not found for reminder ${reminder.id}`);
            continue;
          }

          // Get user and doctor details
          const user = await storage.getUser(appointment.userId);
          const doctor = await storage.getDoctor(appointment.doctorId);
          if (!user || !doctor) {
            console.warn(`User or doctor not found for reminder ${reminder.id}`);
            continue;
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
              continue;
          }

          // Update reminder status
          if (success) {
            await storage.updateReminderStatus(reminder.id, "sent");
            console.log(`Successfully sent reminder ${reminder.id}`);
          } else {
            await storage.updateReminderStatus(reminder.id, "failed");
            console.error(`Failed to send reminder ${reminder.id}`);
          }
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error);
          await storage.updateReminderStatus(reminder.id, "failed");
        }
      }
    } catch (error) {
      console.error("Error processing reminders:", error);
    }
  }, 60000); // Check every minute
} 