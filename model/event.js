import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  time: { type: String, required: true }, // e.g., "07:00"
  duration: { type: Number, required: true },
  date: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
