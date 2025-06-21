import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import redis from "redis";

// Import routes
import authRoutes from "./routes/auth.js";
import studyRoutes from "./routes/study.js";
import todoRoutes from "./routes/todo.js";
import calendarRoutes from "./routes/calendar.js";
import userRoutes from "./routes/user.js";

// Import middleware
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Redis client setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

await redisClient.connect();

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// app.use(cors({ origin: "https://zenquotes.io/api/random" }));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/studyapp")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Make Redis client available to routes
app.use((req, res, next) => {
  req.redis = redisClient;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/study", authMiddleware, studyRoutes);
app.use("/api/todo", authMiddleware, todoRoutes);
app.use("/api/calendar", authMiddleware, calendarRoutes);
app.use("/api/user", authMiddleware, userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Socket.IO for real-time chat
const chatRooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);

    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }

    const room = chatRooms.get(roomId);
    if (room.size < 5) {
      room.add({ id: socket.id, ...user });
      socket.to(roomId).emit("user-joined", user);
      socket.emit("room-users", Array.from(room));
    } else {
      socket.emit("room-full");
    }
  });

  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    chatRooms.forEach((users, roomId) => {
      const userArray = Array.from(users);
      const updatedUsers = userArray.filter((user) => user.id !== socket.id);

      if (updatedUsers.length !== userArray.length) {
        chatRooms.set(roomId, new Set(updatedUsers));
        socket.to(roomId).emit("user-left", socket.id);
      }
    });

    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { redisClient };
