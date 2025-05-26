const cron = require('node-cron');
const { MongoClient } = require('mongodb');
const NotificationStorage = require('./storage/notifications');

async function startScheduler() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB_NAME);
    const notificationStorage = new NotificationStorage(db);

    // Schedule appointment reminders (runs every day at 9 AM)
    cron.schedule('0 9 * * *', async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const nextDay = new Date(tomorrow);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find all appointments scheduled for tomorrow
        const appointments = await db.collection('appointments').find({
          date: {
            $gte: tomorrow,
            $lt: nextDay
          },
          status: 'confirmed'
        }).toArray();

        // Send reminders for each appointment
        for (const appointment of appointments) {
          // Send reminder to patient
          await notificationStorage.createReminderNotification(
            appointment.patientId,
            appointment
          );

          // Send reminder to doctor
          await notificationStorage.createReminderNotification(
            appointment.doctorId,
            appointment
          );
        }

        console.log(`Sent ${appointments.length} appointment reminders`);
      } catch (error) {
        console.error('Error sending appointment reminders:', error);
      }
    });

    // Schedule appointment status updates (runs every hour)
    cron.schedule('0 * * * *', async () => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Find all appointments that were scheduled in the past hour
        const appointments = await db.collection('appointments').find({
          date: {
            $gte: oneHourAgo,
            $lte: now
          },
          status: 'confirmed'
        }).toArray();

        // Update status to 'completed' for past appointments
        for (const appointment of appointments) {
          await db.collection('appointments').updateOne(
            { _id: appointment._id },
            { $set: { status: 'completed' } }
          );

          // Notify patient and doctor about status update
          const updatedAppointment = { ...appointment, status: 'completed' };
          await notificationStorage.createStatusUpdateNotification(
            appointment.patientId,
            updatedAppointment
          );
          await notificationStorage.createStatusUpdateNotification(
            appointment.doctorId,
            updatedAppointment
          );
        }

        console.log(`Updated ${appointments.length} appointment statuses`);
      } catch (error) {
        console.error('Error updating appointment statuses:', error);
      }
    });

    console.log('Scheduler started successfully');
  } catch (error) {
    console.error('Failed to start scheduler:', error);
  }
}

module.exports = { startScheduler }; 