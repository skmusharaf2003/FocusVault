import cron from 'node-cron';
import User from '../models/User.js';
import StudySession from '../models/StudySession.js';
import CalendarEvent from '../models/CalendarEvent.js';
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

    // Check for calendar notifications daily at 8 AM
    cron.schedule('0 8 * * *', () => {
      this.sendCalendarNotifications();
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

  async sendCalendarNotifications() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all users with notifications enabled
      const users = await User.find({
        'preferences.notifications': true,
        emailVerified: true
      });

      for (const user of users) {
        // Get upcoming events for today and tomorrow
        const upcomingEvents = await CalendarEvent.find({
          userId: user._id,
          date: {
            $gte: today,
            $lte: tomorrow
          }
        }).sort({ date: 1, startTime: 1 });

        if (upcomingEvents.length > 0) {
          await this.sendCalendarNotification(user, upcomingEvents);
        }
      }
    } catch (error) {
      console.error('Error sending calendar notifications:', error);
    }
  }

  async sendCalendarNotification(user, events) {
    try {
      const todayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      });

      const tomorrowEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return eventDate.toDateString() === tomorrow.toDateString();
      });

      // Send web push notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationText = todayEvents.length > 0 
          ? `You have ${todayEvents.length} event(s) today`
          : `You have ${tomorrowEvents.length} event(s) tomorrow`;

        this.io.to(`user:${user._id}`).emit('notification', {
          type: 'calendar_reminder',
          title: '📅 Upcoming Events',
          message: notificationText,
          timestamp: new Date(),
          events: events.slice(0, 3) // Send first 3 events
        });
      }

      // Send email notification
      if (user.preferences.emailNotifications) {
        await emailService.sendCalendarNotification(user, todayEvents, tomorrowEvents);
      }

      console.log(`Calendar notification sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send calendar notification to ${user.email}:`, error);
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