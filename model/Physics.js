import mongoose from "mongoose";

const subtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  durationMinutes: { type: Number, required: true },
  questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  overallDifficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  subtopics: [subtopicSchema], // Embedded array of subtopics
});

// Create a Mongoose model for the subject
const Physics = mongoose.model("Physics", chapterSchema);

export default Physics;
