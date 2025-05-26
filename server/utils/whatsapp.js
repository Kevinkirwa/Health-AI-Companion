const twilio = require('twilio');

// Initialize the Twilio client with environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send a WhatsApp message using Twilio
 * @param {string} to - The WhatsApp number to send to (should include country code)
 * @param {string} message - The message content to send
 * @returns {Promise} - A promise that resolves with the message details or rejects with an error
 */
const sendWhatsAppMessage = async (to, message) => {
  try {
    // Format the phone number correctly for Twilio WhatsApp
    const formattedNumber = formatPhoneNumber(to);
    
    // Send the message
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`
    });
    
    console.log(`WhatsApp message sent with SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

/**
 * Format a phone number to ensure it includes the country code
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // If the number starts with 0, replace it with +254 (Kenya country code)
  if (phoneNumber.startsWith('0')) {
    return `+254${phoneNumber.substring(1)}`;
  }
  
  // If the number doesn't include +, add it
  if (!phoneNumber.startsWith('+')) {
    return `+${phoneNumber}`;
  }
  
  return phoneNumber;
};

/**
 * Send appointment confirmation notifications to both doctor and patient
 * @param {Object} appointment - The appointment object
 * @param {Object} doctor - The doctor object
 * @param {Object} patient - The patient object
 * @param {Object} hospital - The hospital object
 * @returns {Promise} - A promise that resolves when both messages are sent
 */
const sendAppointmentConfirmation = async (appointment, doctor, patient, hospital) => {
  try {
    // Prepare date and time for displaying in messages
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Message for the patient
    const patientMessage = `
Hello ${patient.name},

Your appointment with Dr. ${doctor.userId?.name || 'your doctor'} has been confirmed for ${appointmentDate} at ${appointment.time}.

Location: ${hospital.name}
Address: ${hospital.address}

Please arrive 15 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.

Thank you for choosing HealthAICompanion.
`;

    // Message for the doctor
    const doctorMessage = `
Hello Dr. ${doctor.userId?.name || 'Doctor'},

You have a new confirmed appointment with ${patient.name} on ${appointmentDate} at ${appointment.time}.

Patient details:
- Name: ${patient.name}
- Reason for visit: ${appointment.reason || 'Not specified'}

Thank you for using HealthAICompanion.
`;

    // Send messages in parallel
    const results = await Promise.all([
      // Only send to patient if they have a WhatsApp number and have enabled WhatsApp notifications
      patient.whatsappNumber && patient.preferences?.notificationChannels?.whatsapp 
        ? sendWhatsAppMessage(patient.whatsappNumber, patientMessage)
        : Promise.resolve(null),
        
      // Only send to doctor if they have a WhatsApp number and have enabled WhatsApp notifications
      doctor.whatsappNumber && doctor.notificationPreferences?.whatsapp
        ? sendWhatsAppMessage(doctor.whatsappNumber, doctorMessage)
        : Promise.resolve(null)
    ]);
    
    return results;
  } catch (error) {
    console.error('Error sending appointment confirmation notifications:', error);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendAppointmentConfirmation
};
