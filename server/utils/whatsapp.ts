import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp(to: string, message: string) {
  try {
    // Format phone number for WhatsApp
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
    const response = await client.messages.create({
      body: message,
      to: `whatsapp:${formattedNumber}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    });

    console.log('WhatsApp message sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
} 