import express from "express";
import StudySession from "../models/StudySession.js";
import Timetable from "../models/Timetable.js";
import Note from "../models/Note.js";
import User from "../models/User.js";
import UserStudyState from "../models/UserStudyState.js";

const router = express.Router();

// Get dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check Redis cache first
    const cacheKey = `dashboard_${userId}_${today.toDateString()}`;
    const cachedData = await req.redis.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Get today's study sessions
    const todaySessions = await StudySession.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    });

    // Get user stats
    const user = await User.findById(userId);

    // Get weekly data (last 7 days)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const weeklySessions = await StudySession.find({
      userId,
      date: { $gte: weekStart, $lt: tomorrow },
    });

    // Calculate daily totals for the week
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySessions = weeklySessions.filter(
        (session) => session.date >= dayStart && session.date < dayEnd
      );

      const totalMinutes = daySessions.reduce(
        (sum, session) => sum + session.actualTime,
        0
      );

      weeklyData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        date: date.toISOString(),
      });
    }

    const dashboardData = {
      todayReading:
        Math.round(
          (todaySessions.reduce((sum, s) => sum + s.actualTime, 0) / 60) * 10
        ) / 10,
      studySessions: todaySessions.length,
      currentStreak: user.stats.currentStreak,
      highestStreak: user.stats.highestStreak,
      weeklyData,
      completedSubjects: todaySessions.filter((s) => s.completed),
    };

    // Cache for 5 minutes
    await req.redis.setEx(cacheKey, 300, JSON.stringify(dashboardData));

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const { date, subject, page = 1, limit = 20 } = req.query;
    const userId = req.userId;

    const query = { userId };

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (subject) {
      query.subject = subject;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await StudySession.countDocuments(query);

    const sessions = await StudySession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      sessions,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    res.status(500).json({ message: "Failed to fetch study sessions" });
  }
});

// GET /api/study/sessions/today
router.get("/sessions/today", async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const sessions = await StudySession.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching today's study sessions:", error);
    res.status(500).json({ message: "Failed to fetch today's study sessions" });
  }
});

// GET /api/study/sessions/stats
router.get("/sessions/stats", async (req, res) => {
  try {
    const userId = req.userId;
    const { period = "week" } = req.query;

    let startDate = new Date();
    switch (period) {
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "week":
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const sessions = await StudySession.find({
      userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce(
      (sum, s) => sum + (s.actualTime || 0),
      0
    );
    const completedSessions = sessions.filter((s) => s.completed).length;
    const averageSessionTime =
      totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    const subjectStats = {};
    const dailyStats = {};

    sessions.forEach((session) => {
      const date = session.createdAt.toISOString().split("T")[0];

      // Subject stats
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          sessions: 0,
          totalTime: 0,
          completed: 0,
        };
      }
      subjectStats[session.subject].sessions++;
      subjectStats[session.subject].totalTime += session.actualTime || 0;
      if (session.completed) subjectStats[session.subject].completed++;

      // Daily stats
      if (!dailyStats[date]) {
        dailyStats[date] = { date, sessions: 0, totalTime: 0, completed: 0 };
      }
      dailyStats[date].sessions++;
      dailyStats[date].totalTime += session.actualTime || 0;
      if (session.completed) dailyStats[date].completed++;
    });

    res.json({
      summary: {
        totalSessions,
        totalStudyTime,
        completedSessions,
        averageSessionTime,
        completionRate:
          totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      },
      subjectStats,
      dailyStats: Object.values(dailyStats),
      period,
    });
  } catch (error) {
    console.error("Error fetching session stats:", error);
    res.status(500).json({ message: "Failed to fetch session statistics" });
  }
});

// POST /api/study/sessions
router.post("/sessions", async (req, res) => {
  try {
    const {
      subject,
      actualTime,
      targetTime,
      startTime,
      endTime,
      completed,
      notes,
    } = req.body;
    const userId = req.userId;

    if (!subject || actualTime === undefined) {
      return res
        .status(400)
        .json({ message: "Subject and actualTime are required" });
    }

    const session = await StudySession.create({
      userId,
      subject,
      actualTime,
      targetTime: targetTime || null,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
      completed: completed || false,
      notes: notes || "",
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating study session:", error);
    res.status(500).json({ message: "Failed to create study session" });
  }
});

// PUT /api/study/sessions/:id
router.put("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, actualTime, startTime, endTime, completed, notes } =
      req.body;
    const userId = req.user.id;

    const session = await StudySession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    session.subject = subject || session.subject;
    session.actualTime =
      actualTime !== undefined ? actualTime : session.actualTime;
    session.startTime = startTime ? new Date(startTime) : session.startTime;
    session.endTime = endTime ? new Date(endTime) : session.endTime;
    session.completed = completed !== undefined ? completed : session.completed;
    session.notes = notes !== undefined ? notes : session.notes;

    await session.save();
    res.json(session);
  } catch (error) {
    console.error("Error updating study session:", error);
    res.status(500).json({ message: "Failed to update study session" });
  }
});

// DELETE /api/study/sessions/:id
router.delete("/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await StudySession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    await session.deleteOne();
    res.json({ message: "Study session deleted successfully" });
  } catch (error) {
    console.error("Error deleting study session:", error);
    res.status(500).json({ message: "Failed to delete study session" });
  }
});

router.get("/quote", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// Get timetables
router.get("/timetables", async (req, res) => {
  try {
    const cacheKey = `timetable_active_${req.userId}`;
    const cached = await req.redis.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const timetables = await Timetable.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    // Optional: cache only if there's an active timetable
    const activeTimetable = timetables.find((t) => t.isActive);
    if (activeTimetable) {
      await req.redis.setEx(cacheKey, 300, JSON.stringify(timetables)); // Cache for 5 minutes
    }

    res.json(timetables);
  } catch (error) {
    console.error("Get timetables error:", error);
    res.status(500).json({ message: "Failed to fetch timetables" });
  }
});

// Create timetable
router.post("/timetables", async (req, res) => {
  try {
    const { name, description, schedule, isActive } = req.body;

    if (!name || !schedule || typeof schedule !== "object") {
      return res
        .status(400)
        .json({ message: "Name and schedule are required and must be valid." });
    }

    const allowedDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const sanitizedSchedule = {};

    // Sanitize each day's schedule
    for (const day of allowedDays) {
      if (Array.isArray(schedule[day])) {
        sanitizedSchedule[day] = schedule[day]
          .map((slot) => ({
            time: slot.time || "",
            subject: slot.subject?.trim() || "",
            duration: Number(slot.duration) || 60,
          }))
          .filter((slot) => slot.time && slot.subject);
      } else {
        sanitizedSchedule[day] = [];
      }
    }

    // Create new timetable
    const timetable = new Timetable({
      userId: req.userId,
      name: name.trim(),
      description: description?.trim() || "",
      schedule: sanitizedSchedule,
      isActive: !!isActive,
    });

    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    console.error("Create timetable error:", error);
    res.status(500).json({ message: "Failed to create timetable" });
  }
});

router.put("/timetables/:id/activate", async (req, res) => {
  try {
    await Timetable.updateMany({ userId: req.userId }, { isActive: false });
    const updated = await Timetable.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: true },
      { new: true }
    );
    const allTimetables = await Timetable.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    await req.redis.setEx(
      `timetable_active_${req.userId}`,
      300,
      JSON.stringify(allTimetables)
    );
    if (!updated) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Set active timetable error:", error);
    res.status(500).json({ message: "Failed to set active timetable" });
  }
});

router.delete("/timetables/:id", async (req, res) => {
  try {
    await Timetable.deleteOne({ _id: req.params.id, userId: req.userId });
    res.status(200).json({ message: "Timetable deleted successfully" });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({ message: "Failed to delete timetable" });
  }
});

router.put("/timetables/:id", async (req, res) => {
  try {
    const { name, description, schedule, isActive } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, schedule, isActive },
      { new: true }
    );
    res.json(timetable);
  } catch (error) {
    console.error("Update timetable error:", error);
    res.status(500).json({ message: "Failed to update timetable" });
  }
});

// Get notes
router.get("/notes", async (req, res) => {
  try {
    const { search, subject, page = 1, limit = 20 } = req.query;
    const query = { userId: req.userId };

    if (search) query.$text = { $search: search };
    if (subject) query.subject = subject;

    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// Create note
router.post("/notes", async (req, res) => {
  try {
    const { title, body, subject, tags, isPinned } = req.body;

    const note = new Note({
      userId: req.userId,
      title,
      body,
      subject,
      tags,
      isPinned,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
});

// Update note
router.put("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
});

// Delete note
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

// Get user study state

router.get("/state", async (req, res) => {
  const state = await UserStudyState.findOne({ userId: req.userId });
  res.json(state || {});
});

// Update or create state
router.post("/state", async (req, res) => {
  const { currentSubject, elapsedTime, startTime, status } = req.body;
  const update = {
    currentSubject,
    elapsedTime,
    startTime,
    status,
    updatedAt: new Date(),
  };

  const state = await UserStudyState.findOneAndUpdate(
    { userId: req.userId },
    update,
    { upsert: true, new: true }
  );

  res.json(state);
});

// Clear state on completion
router.delete("/state", async (req, res) => {
  await UserStudyState.deleteOne({ userId: req.userId });
  res.status(204).end();
});

export default router;
