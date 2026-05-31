import mongoose from "mongoose";

const TeacherActionSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherClass", required: true },
    type: {
      type: String,
      enum: ["extra-class", "reschedule", "surprise-test", "extra-work"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["planned", "scheduled", "conducted", "completed", "cancelled"],
      default: "scheduled",
    },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    durationMinutes: { type: Number, default: 60 },
    chapter: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rescheduleFromDate: { type: String, default: "" },
    rescheduleFromTime: { type: String, default: "" },
    rescheduleToDate: { type: String, default: "" },
    rescheduleToTime: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const TeacherAction = mongoose.model("TeacherAction", TeacherActionSchema);
export default TeacherAction;
