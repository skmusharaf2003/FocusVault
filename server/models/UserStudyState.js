import mongoose from "mongoose";

const userStudyStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  currentSubject: { type: String, trim: true },
  startTime: { type: Date },
  elapsedTime: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "paused"], default: "paused" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserStudyState", userStudyStateSchema);
