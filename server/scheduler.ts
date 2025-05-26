import cron from 'node-cron';
import { ReminderService } from './services/reminderService';

export function startScheduler() {
  // Run every hour to check for appointments that need reminders
  cron.schedule('0 * * * *', async () => {
    console.log('Running appointment reminder check...');
    await ReminderService.processPendingReminders();
  });

  // Run daily at midnight to clean up old appointments
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup...');
    // Add cleanup logic here if needed
  });

  console.log('Scheduler started');
} 