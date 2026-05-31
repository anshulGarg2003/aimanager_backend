import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number }, // index of selected option
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 },
});

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number }, // in seconds
  status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "completed" },
  attemptedAt: { type: Date, default: Date.now },
});

// Calculate percentage before saving
QuizAttemptSchema.pre("save", function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }
  next();
});

const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);
export default QuizAttempt;
