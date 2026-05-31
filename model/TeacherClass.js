import mongoose from "mongoose";

const TeacherClassSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    room: { type: String, default: "" },
    scheduleDays: [{ type: String }],
    scheduleTime: { type: String, default: "" },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const TeacherClass = mongoose.model("TeacherClass", TeacherClassSchema);
export default TeacherClass;
