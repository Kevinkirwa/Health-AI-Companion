import nodemailer from 'nodemailer';

interface EmailContent {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create a transporter using the default SMTP transport
const createTransporter = () => {
  // For Gmail:
  // - You'll need to use an "App Password" if you have 2FA enabled
  // - Otherwise, you'll need to enable "Less secure app access"
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',  // Can be 'gmail', 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER || '',  // Your email address
      pass: process.env.EMAIL_PASSWORD || '', // Your email password or app password
    },
  });
};

// Alternatively, use a free SMTP service like Mailtrap for testing or Mailgun's free tier
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
//     port: parseInt(process.env.EMAIL_PORT || '2525'),
//     auth: {
//       user: process.env.EMAIL_USER || '',
//       pass: process.env.EMAIL_PASSWORD || '',
//     },
//   });
// };

export async function sendEmail({ to, subject, text, html }: EmailContent) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Email will not be sent.');
      return;
    }

    const transporter = createTransporter();
    
    const msg = {
      to,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(msg);
    console.log('Email sent successfully to:', to, 'MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
} 