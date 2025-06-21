import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This should match your User model name
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    actualTime: {
      type: Number, // Time in seconds
      required: true,
      default: 0,
    },
    targetTime: {
      type: Number, // Optional
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ userId: 1, subject: 1 });
studySessionSchema.index({ createdAt: 1 });

const StudySession = mongoose.model("StudySession", studySessionSchema);

export default StudySession;
