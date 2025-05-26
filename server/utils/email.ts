import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailContent {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailContent) {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email will not be sent.');
      return;
    }

    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@healthaicompanion.com',
      subject,
      text,
      html: html || text
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
} 