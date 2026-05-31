import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false },
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema],
  explanation: { type: String },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  marks: { type: Number, default: 1 },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  totalMarks: { type: Number, default: 0 },
  duration: { type: Number, required: true }, // in minutes
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  grade: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-calculate totalMarks before saving
QuizSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  next();
});

const Quiz = mongoose.model("Quiz", QuizSchema);
export default Quiz;
