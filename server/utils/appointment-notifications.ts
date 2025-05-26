import { sendEmail } from './email';

/**
 * Send appointment confirmation notifications to both doctor and patient via email
 * @param {Object} appointment - The appointment object
 * @param {Object} doctor - The doctor object
 * @param {Object} patient - The patient object
 * @param {Object} hospital - The hospital object
 * @returns {Promise} - A promise that resolves when both messages are sent
 */
export const sendAppointmentConfirmationEmails = async (appointment: any, doctor: any, patient: any, hospital: any) => {
  try {
    // Prepare date and time for displaying in messages
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Content for the patient
    const patientSubject = `Appointment Confirmation with Dr. ${doctor.userId?.name || 'your doctor'}`;
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Appointment Confirmation</h2>
        <p>Hello ${patient.name},</p>
        <p>Your appointment with <strong>Dr. ${doctor.userId?.name || 'your doctor'}</strong> has been confirmed for:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${hospital.name}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${hospital.address}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        <p>Thank you for choosing HealthAICompanion.</p>
      </div>
    `;

    // Content for the doctor
    const doctorSubject = `New Appointment with ${patient.name}`;
    const doctorHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Appointment</h2>
        <p>Hello Dr. ${doctor.userId?.name || 'Doctor'},</p>
        <p>You have a new confirmed appointment with <strong>${patient.name}</strong>:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
          <p style="margin: 5px 0;"><strong>Reason for visit:</strong> ${appointment.reason || 'Not specified'}</p>
        </div>
        <p>Patient details:</p>
        <ul>
          <li><strong>Name:</strong> ${patient.name}</li>
          <li><strong>Email:</strong> ${patient.email || 'Not provided'}</li>
          ${patient.phone ? `<li><strong>Phone:</strong> ${patient.phone}</li>` : ''}
        </ul>
        <p>Thank you for using HealthAICompanion.</p>
      </div>
    `;

    // Send emails in parallel
    const results = await Promise.all([
      // Send to patient if they have an email
      patient.email 
        ? sendEmail({
            to: patient.email,
            subject: patientSubject,
            text: patientSubject,
            html: patientHtml
          })
        : Promise.resolve(null),
        
      // Send to doctor if they have an email
      doctor.email || doctor.userId?.email
        ? sendEmail({
            to: doctor.email || doctor.userId?.email,
            subject: doctorSubject,
            text: doctorSubject,
            html: doctorHtml
          })
        : Promise.resolve(null)
    ]);
    
    return results;
  } catch (error) {
    console.error('Error sending appointment confirmation emails:', error);
    throw error;
  }
};

/**
 * Send appointment reminder emails
 * @param {Object} user - The user to send the reminder to (patient or doctor)
 * @param {Object} doctor - The doctor information
 * @param {Object} appointment - The appointment details
 * @param {Object} reminder - The reminder object with message
 * @returns {Promise} - A promise that resolves when the email is sent
 */
export const sendAppointmentReminderEmail = async (user: any, doctor: any, appointment: any, reminder: any) => {
  try {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Different email content depending on if this is for the doctor or patient
    const isDoctor = user.role === 'doctor';
    const otherPerson = isDoctor ? 'patient' : 'Dr. ' + doctor.name;
    
    const subject = `Reminder: Upcoming Appointment on ${appointmentDate}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Appointment Reminder</h2>
        <p>Hello ${user.name},</p>
        <p>This is a reminder about your upcoming appointment with ${otherPerson}:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
          ${!isDoctor ? `<p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctor.name}</p>` : ''}
          ${!isDoctor && appointment.hospitalId ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${appointment.hospitalId.name || 'Hospital'}</p>` : ''}
        </div>
        <p>${reminder.message || ''}</p>
        <p>Thank you for using HealthAICompanion.</p>
      </div>
    `;

    // Send the email if user has an email address
    if (user.email) {
      return await sendEmail({
        to: user.email,
        subject,
        text: subject,
        html
      });
    }
    
    console.log(`No email address found for user ${user._id}, skipping reminder`);
    return null;
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
    throw error;
  }
};
