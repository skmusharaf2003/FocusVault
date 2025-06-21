import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import StudySession from '../models/StudySession.js';

const router = express.Router();

// Get events for date range
router.get('/events', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const events = await CalendarEvent.find({
      userId: req.userId,
      date: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ date: 1, startTime: 1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Create new event
router.post('/events', async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, type, subject, priority } = req.body;
    
    const event = new CalendarEvent({
      userId: req.userId,
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      type,
      subject,
      priority
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// Get study streaks
router.get('/streaks', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const studySessions = await StudySession.find({
      userId: req.userId,
      date: { $gte: thirtyDaysAgo },
      completed: true
    }).select('date');

    // Group by date and return unique dates
    const streakDates = [...new Set(studySessions.map(session => 
      session.date.toISOString().split('T')[0]
    ))].map(dateStr => ({ date: dateStr }));

    res.json(streakDates);
  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({ message: 'Failed to fetch study streaks' });
  }
});

export default router;