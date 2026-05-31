import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["student", "teacher", "all"],
      default: "student",
    },
    level: {
      type: String,
      enum: ["info", "warning", "urgent"],
      default: "info",
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);

export default Announcement;
