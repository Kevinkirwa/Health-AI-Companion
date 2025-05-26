const { ObjectId } = require('mongodb');

class NotificationStorage {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('notifications') : null;
    this.isConnected = !!this.collection;
    
    if (!this.isConnected) {
      console.warn('NotificationStorage initialized without a valid database connection. Using mock mode.');
    }
  }

  async createNotification(userId, data) {
    if (!this.isConnected) {
      console.warn('Attempted to create notification without database connection');
      return { 
        _id: 'mock-id-' + Date.now(),
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        createdAt: new Date(),
        metadata: data.metadata || {}
      };
    }
    
    try {
      const notification = {
        userId: new ObjectId(userId),
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        createdAt: new Date(),
        metadata: data.metadata || {}
      };

      const result = await this.collection.insertOne(notification);
      return { ...notification, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getNotifications(userId) {
    if (!this.isConnected) {
      console.warn('Attempted to get notifications without database connection');
      return [];
    }
    
    try {
      return await this.collection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId, userId) {
    if (!this.isConnected) {
      console.warn('Attempted to mark notification as read without database connection');
      return true; // Pretend it worked in mock mode
    }
    
    try {
      const result = await this.collection.updateOne(
        {
          _id: new ObjectId(notificationId),
          userId: new ObjectId(userId)
        },
        {
          $set: { read: true }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId) {
    if (!this.isConnected) {
      console.warn('Attempted to mark all notifications as read without database connection');
      return true;
    }
    
    try {
      await this.collection.updateMany(
        {
          userId: new ObjectId(userId),
          read: false
        },
        {
          $set: { read: true }
        }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId, userId) {
    if (!this.isConnected) {
      console.warn('Attempted to delete notification without database connection');
      return true; // Pretend it worked in mock mode
    }
    
    try {
      const result = await this.collection.deleteOne({
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId)
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async deleteAllNotifications(userId) {
    if (!this.isConnected) {
      console.warn('Attempted to delete all notifications without database connection');
      return true; // Pretend it worked in mock mode
    }
    
    try {
      await this.collection.deleteMany({
        userId: new ObjectId(userId)
      });
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  async getUnreadCount(userId) {
    if (!this.isConnected) {
      console.warn('Attempted to get unread count without database connection');
      return 0; // Return zero notifications in mock mode
    }
    
    try {
      return await this.collection.countDocuments({
        userId: new ObjectId(userId),
        read: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async createAppointmentNotification(userId, appointment) {
    try {
      return await this.createNotification(userId, {
        type: 'appointment',
        title: 'New Appointment',
        message: `You have a new appointment scheduled for ${new Date(appointment.date).toLocaleString()}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          date: appointment.date
        }
      });
    } catch (error) {
      console.error('Error creating appointment notification:', error);
      return null;
    }
  }

  async createReminderNotification(userId, appointment) {
    try {
      return await this.createNotification(userId, {
        type: 'reminder',
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment tomorrow at ${new Date(appointment.date).toLocaleString()}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          date: appointment.date
        }
      });
    } catch (error) {
      console.error('Error creating reminder notification:', error);
      return null;
    }
  }

  async createStatusUpdateNotification(userId, appointment) {
    try {
      return await this.createNotification(userId, {
        type: 'status_update',
        title: 'Appointment Status Updated',
        message: `Your appointment status has been updated to ${appointment.status}`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          status: appointment.status
        }
      });
    } catch (error) {
      console.error('Error creating status update notification:', error);
      return null;
    }
  }
}

module.exports = NotificationStorage; 