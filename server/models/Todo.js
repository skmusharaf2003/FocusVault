import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  }
}, {
  timestamps: true
});

// Update completedAt when todo is marked as completed
todoSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    this.completedAt = this.completed ? new Date() : undefined;
  }
  next();
});

// Index for efficient queries
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Todo', todoSchema);