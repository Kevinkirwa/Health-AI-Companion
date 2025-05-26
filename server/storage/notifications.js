const { ObjectId } = require('mongodb');

class NotificationStorage {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('notifications');
  }

  async createNotification(userId, data) {
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
  }

  async getNotifications(userId) {
    return await this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async markNotificationAsRead(notificationId, userId) {
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
  }

  async markAllNotificationsAsRead(userId) {
    await this.collection.updateMany(
      {
        userId: new ObjectId(userId),
        read: false
      },
      {
        $set: { read: true }
      }
    );
  }

  async deleteNotification(notificationId, userId) {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(notificationId),
      userId: new ObjectId(userId)
    });

    return result.deletedCount > 0;
  }

  async deleteAllNotifications(userId) {
    await this.collection.deleteMany({
      userId: new ObjectId(userId)
    });
  }

  async getUnreadCount(userId) {
    return await this.collection.countDocuments({
      userId: new ObjectId(userId),
      read: false
    });
  }

  async createAppointmentNotification(userId, appointment) {
    return this.createNotification(userId, {
      type: 'appointment',
      title: 'New Appointment',
      message: `You have a new appointment scheduled for ${new Date(appointment.date).toLocaleString()}`,
      metadata: {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        date: appointment.date
      }
    });
  }

  async createReminderNotification(userId, appointment) {
    return this.createNotification(userId, {
      type: 'reminder',
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment tomorrow at ${new Date(appointment.date).toLocaleString()}`,
      metadata: {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        date: appointment.date
      }
    });
  }

  async createStatusUpdateNotification(userId, appointment) {
    return this.createNotification(userId, {
      type: 'status_update',
      title: 'Appointment Status Updated',
      message: `Your appointment status has been updated to ${appointment.status}`,
      metadata: {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        status: appointment.status
      }
    });
  }
}

module.exports = NotificationStorage; 