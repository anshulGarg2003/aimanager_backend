import mongoose from "mongoose";

const StudySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  chapter: { type: String },
  topic: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  sessionType: {
    type: String,
    enum: ["study", "revision", "practice", "quiz", "assignment"],
    default: "study",
  },
  notes: { type: String },
  productivity: { type: Number, min: 1, max: 5 }, // self-rated 1-5
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

// Auto-calculate duration before saving
StudySessionSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round(
      (this.endTime.getTime() - this.startTime.getTime()) / 60000
    );
  }
  next();
});

const StudySession = mongoose.model("StudySession", StudySessionSchema);
export default StudySession;
