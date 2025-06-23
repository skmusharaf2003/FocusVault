// models/Feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["positive", "moderate", "general"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    suggestion: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    // Future-proofing fields
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    upvotes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    responses: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerifiedUser: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting and filtering
feedbackSchema.index({ type: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ isActive: 1 });

// Virtual for upvote count
feedbackSchema.virtual("upvoteCount").get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

// Method to check if user has upvoted
feedbackSchema.methods.hasUserUpvoted = function (userId) {
  return this.upvotes.some(
    (upvote) => upvote.userId.toString() === userId.toString()
  );
};

// Static method to get grouped feedback
feedbackSchema.statics.getGroupedFeedback = async function () {
  const feedback = await this.find({ isActive: true })
    .populate("userId", "name email profileImage isVerified")
    .sort({ type: 1, createdAt: -1 })
    .lean();

  // Group by type and sort by priority
  const typeOrder = { positive: 1, moderate: 2, general: 3 };

  const grouped = feedback.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // Sort groups by priority
  const sortedGrouped = {};
  Object.keys(grouped)
    .sort((a, b) => typeOrder[a] - typeOrder[b])
    .forEach((key) => {
      sortedGrouped[key] = grouped[key];
    });

  return sortedGrouped;
};

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
