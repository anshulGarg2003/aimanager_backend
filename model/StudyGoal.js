import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  targetDate: { type: String }, // YYYY-MM-DD
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const StudyGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  goalType: {
    type: String,
    enum: ["study-hours", "quiz-score", "chapter-completion", "streak", "custom"],
    required: true,
  },
  targetValue: { type: Number, required: true }, // e.g., 100 hours, 90% score
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: "" }, // "hours", "%" , "chapters"
  deadline: { type: String }, // YYYY-MM-DD
  milestones: [milestoneSchema],
  status: {
    type: String,
    enum: ["active", "completed", "failed", "paused"],
    default: "active",
  },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const StudyGoal = mongoose.model("StudyGoal", StudyGoalSchema);
export default StudyGoal;
