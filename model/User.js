import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  picture: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  completed: [{ type: String }],
  isPaid: { type: Boolean, default: false },
  grade: { type: String },
  school: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User;
