import { Router } from 'express';
import { IStorage } from '../storage';
import { Appointment } from '../models/Appointment';
import { Reminder } from '../models/Reminder';

export function setupWebhookRoutes(app: Router, storage: IStorage) {
  // WhatsApp webhook for handling responses
  app.post('/webhooks/whatsapp', async (req, res) => {
    try {
      const { From, Body } = req.body;
      
      // Extract phone number from WhatsApp format
      const phoneNumber = From.replace('whatsapp:', '');
      
      // Find the most recent pending reminder for this phone number
      const reminder = await Reminder.findOne({
        status: 'sent',
        type: 'whatsapp',
        'user.phone': phoneNumber
      }).sort({ sentAt: -1 });

      if (!reminder) {
        console.warn(`No pending reminder found for phone number: ${phoneNumber}`);
        return res.sendStatus(200);
      }

      // Process the response
      const response = Body.trim().toUpperCase();
      let status = 'pending';
      let appointmentStatus = 'confirmed';

      switch (response) {
        case 'YES':
          status = 'confirmed';
          appointmentStatus = 'confirmed';
          break;
        case 'NO':
          status = 'cancelled';
          appointmentStatus = 'cancelled';
          break;
        case 'RESCHEDULE':
          status = 'reschedule_requested';
          appointmentStatus = 'reschedule_requested';
          break;
        default:
          console.warn(`Invalid response received: ${response}`);
          return res.sendStatus(200);
      }

      // Update reminder status
      reminder.status = status;
      reminder.response = response;
      reminder.responseAt = new Date();
      await reminder.save();

      // Update appointment status
      await Appointment.findByIdAndUpdate(reminder.appointmentId, {
        status: appointmentStatus
      });

      // Send confirmation message
      const confirmationMessage = status === 'confirmed' 
        ? 'Thank you for confirming your appointment.'
        : status === 'cancelled'
        ? 'Your appointment has been cancelled.'
        : 'We have received your reschedule request. We will contact you shortly.';

      await storage.sendWhatsApp(phoneNumber, confirmationMessage);

      res.sendStatus(200);
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      res.sendStatus(500);
    }
  });
} 