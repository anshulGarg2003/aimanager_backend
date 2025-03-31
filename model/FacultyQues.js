import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  FacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"],
  },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Question", QuestionSchema);

export default Question;
