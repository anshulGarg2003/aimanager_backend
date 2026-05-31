import mongoose from "mongoose";

const subtopicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  duration: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

const chapterSchema = new mongoose.Schema({
  chapter: { type: String, required: true },
  overallDifficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  grade: { type: String, required: true },
  subtopics: [subtopicSchema],
});

const PhysicalChemistry = mongoose.model("PhysicalChemistry", chapterSchema);

export default PhysicalChemistry;
