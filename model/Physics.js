import mongoose from "mongoose";

const subtopicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  duration: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], // Embedded array of questions
});

const chapterSchema = new mongoose.Schema({
  chapter: { type: String, required: true },
  overallDifficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  grade: { type: String, required: true },
  subtopics: [subtopicSchema], // Embedded array of subtopics
});

// Create a Mongoose model for the subject
const Physics = mongoose.model("Physics", chapterSchema);

export default Physics;
