import express from "express";
import Message from "../models/Message.js";
import { authMiddleware, requireEmailVerification } from "../middleware/auth.js";

const router = express.Router();

// Get messages for a room
router.get("/messages/:room", authMiddleware, requireEmailVerification, async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ room })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Get user's recent rooms
router.get("/rooms", authMiddleware, requireEmailVerification, async (req, res) => {
  try {
    const recentRooms = await Message.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$room", lastMessage: { $max: "$createdAt" } } },
      { $sort: { lastMessage: -1 } },
      { $limit: 10 }
    ]);

    res.json(recentRooms.map(room => room._id));
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

export default router;