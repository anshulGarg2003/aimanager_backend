import mongoose from "mongoose";

const HolidayRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    teacherComment: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const HolidayRequest = mongoose.model("HolidayRequest", HolidayRequestSchema);

export default HolidayRequest;
