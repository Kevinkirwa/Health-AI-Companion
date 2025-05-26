const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  async sendWhatsAppMessage(to, message) {
    try {
      // Format the phone number to include the WhatsApp prefix
      const formattedNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const fromNumber = `whatsapp:${this.whatsappNumber}`;

      const result = await this.client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedNumber
      });

      console.log('WhatsApp message sent successfully:', result.sid);
      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendAppointmentConfirmation(to, appointmentDetails) {
    const message = `
🏥 Appointment Confirmation

Dear ${appointmentDetails.patientName},

Your appointment has been confirmed:
📅 Date: ${appointmentDetails.date}
⏰ Time: ${appointmentDetails.time}
👨‍⚕️ Doctor: ${appointmentDetails.doctorName}
🏥 Hospital: ${appointmentDetails.hospitalName}

Please arrive 15 minutes before your appointment time.
If you need to reschedule, please contact us at least 24 hours in advance.

Thank you for choosing our services!
    `.trim();

    return this.sendWhatsAppMessage(to, message);
  }

  async sendAppointmentReminder(to, appointmentDetails) {
    const message = `
⏰ Appointment Reminder

Dear ${appointmentDetails.patientName},

This is a reminder for your upcoming appointment:
📅 Date: ${appointmentDetails.date}
⏰ Time: ${appointmentDetails.time}
👨‍⚕️ Doctor: ${appointmentDetails.doctorName}
🏥 Hospital: ${appointmentDetails.hospitalName}

Please confirm your attendance by replying:
✅ YES - to confirm
❌ NO - to cancel

Thank you!
    `.trim();

    return this.sendWhatsAppMessage(to, message);
  }

  async sendDoctorNotification(to, notificationDetails) {
    const message = `
👨‍⚕️ Doctor Notification

Dear Dr. ${notificationDetails.doctorName},

${notificationDetails.message}

Details:
📅 Date: ${notificationDetails.date}
⏰ Time: ${notificationDetails.time}
🏥 Hospital: ${notificationDetails.hospitalName}

Thank you!
    `.trim();

    return this.sendWhatsAppMessage(to, message);
  }

  async sendFollowUpReminder(to, followUpDetails) {
    const message = `
🏥 Follow-Up Reminder

Dear ${followUpDetails.patientName},

This is a follow-up reminder after your recent appointment with Dr. ${followUpDetails.doctorName} on ${followUpDetails.appointmentDate}.

${followUpDetails.customMessage || 'How are you feeling? Please remember to take your medications as prescribed.'}

${followUpDetails.followUpNeeded ? `Your next follow-up appointment is scheduled for ${followUpDetails.followUpDate}.` : 'Please let us know if you would like to schedule a follow-up appointment.'}

Reply with:
👍 GOOD - if you're feeling better
👎 BAD - if you're not improving
📅 SCHEDULE - if you want to schedule a follow-up appointment

Your health is our priority!
    `.trim();

    return this.sendWhatsAppMessage(to, message);
  }
}

module.exports = new TwilioService(); 