import mongoose from "mongoose";
const timetableEntrySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    duration: { type: Number, default: 60 },
  },
  { _id: true }
);

const dayWiseScheduleSchema = new mongoose.Schema(
  {
    monday: [timetableEntrySchema],
    tuesday: [timetableEntrySchema],
    wednesday: [timetableEntrySchema],
    thursday: [timetableEntrySchema],
    friday: [timetableEntrySchema],
    saturday: [timetableEntrySchema],
    sunday: [timetableEntrySchema],
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    schedule: dayWiseScheduleSchema, // ⬅️ NEW FORMAT
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
