import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: "student" },
  picture: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  completed: [{ type: String }],
  isPaid: { type: Boolean, default: false },
  grade: { type: String },
  school: { type: String },
  // Extended profile
  phone: { type: String },
  bio: { type: String },
  subjects: [{ type: String }], // subjects the student is studying
  department: { type: String },
  qualification: { type: String },
  yearsExperience: { type: Number, default: 0 },
  teacherCode: { type: String },
  // Study stats (denormalized for fast dashboard reads)
  stats: {
    totalStudyHours: { type: Number, default: 0 },
    totalQuizzesAttempted: { type: Number, default: 0 },
    avgQuizScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: String },
  },
  achievements: [
    {
      title: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User;
