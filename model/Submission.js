import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  chapter: { type: String },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  questionTitle: { type: String },
  questionText: { type: String },
  // Legacy image-based submission URL (kept for backward compatibility)
  imageUrl: { type: String },
  // New exam workflow: full answer sheet PDF as data URL or hosted URL
  answerPdfDataUrl: {
    type: String,
    required: function () {
      return !this.imageUrl;
    },
  },
  // Per-page answer captures used for page-wise preview and annotation overlays.
  answerPageImages: [{ type: String }],
  pageCount: { type: Number, default: 1 },
  // Teacher-reviewed, annotated PDF version returned to students.
  reviewedPdfDataUrl: { type: String },
  examType: {
    type: String,
    enum: ["quiz", "assignment", "written-exam", "practice"],
    default: "written-exam",
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "returned"],
    default: "pending",
  },
  marks: { type: Number },
  totalMarks: { type: Number },
  feedback: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
