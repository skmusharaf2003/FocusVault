import cron from 'node-cron';
import User from '../models/User.js';
import StudySession from '../models/StudySession.js';
import emailService from './emailService.js';

class NotificationService {
  constructor(io) {
    this.io = io;
    this.setupCronJobs();
  }

  setupCronJobs() {
    // Check for study reminders every hour
    cron.schedule('0 * * * *', () => {
      this.checkStudyReminders();
    });

    console.log('Notification service initialized with cron jobs');
  }

  async checkStudyReminders() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Get users who should receive reminders
      const users = await User.find({
        'preferences.studyReminders': true,
        'preferences.emailNotifications': true,
        emailVerified: true,
        $or: [
          { lastNotificationSent: { $exists: false } },
          { lastNotificationSent: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      });

      for (const user of users) {
        const preferredStart = user.preferences.preferredStudyHours.start;
        const preferredEnd = user.preferences.preferredStudyHours.end;

        // Check if current time is within preferred study hours
        if (this.isWithinStudyHours(currentTime, preferredStart, preferredEnd)) {
          // Check if user has studied today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todaySession = await StudySession.findOne({
            userId: user._id,
            createdAt: { $gte: today }
          });

          if (!todaySession) {
            // Send reminder
            await this.sendStudyReminder(user);
          }
        }
      }
    } catch (error) {
      console.error('Error checking study reminders:', error);
    }
  }

  isWithinStudyHours(currentTime, startTime, endTime) {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Handle overnight time ranges
      return current >= start || current <= end;
    }
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async sendStudyReminder(user) {
    try {
      // Send email reminder
      await emailService.sendStudyReminder(user);

      // Send real-time notification if user is online
      this.io.to(`user:${user._id}`).emit('notification', {
        type: 'study_reminder',
        title: "It's Study Time! 📚",
        message: `Hey ${user.name}, it's your preferred study time. Don't break your ${user.stats.currentStreak}-day streak!`,
        timestamp: new Date(),
      });

      // Update last notification sent
      await User.findByIdAndUpdate(user._id, {
        lastNotificationSent: new Date()
      });

      console.log(`Study reminder sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send study reminder to ${user.email}:`, error);
    }
  }

  // Send real-time notifications
  sendNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  // Broadcast to all users in a room
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
}

export default NotificationService;