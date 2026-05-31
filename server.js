import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import eventRoute from "./api/eventRoute.js";
import userRoute from "./api/userRoute.js";
import chapterRoute from "./api/chapterRoute.js";
import questionRoute from "./api/questionRoute.js";
import mathsRoutes from "./api/MathRoute.js";
import physicsRoutes from "./api/PhysicsRoute.js";
import physicalChemRoutes from "./api/PhysicalChemRoute.js";
import quizRoute from "./api/quizRoute.js";
import analyticsRoute from "./api/analyticsRoute.js";
import studySessionRoute from "./api/studySessionRoute.js";
import goalRoute from "./api/goalRoute.js";
import submissionRoute from "./api/submissionRoute.js";
import teacherControlRoute from "./api/teacherControlRoute.js";
import announcementRoute from "./api/announcementRoute.js";
import holidayRoute from "./api/holidayRoute.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: true, limit: "35mb" }));
app.use(cors());

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Existing routes
app.use("/api", eventRoute);
app.use("/api/users", userRoute);
app.use("/api/schedule", chapterRoute);
app.use("/api/questions", questionRoute);
app.use("/api/maths", mathsRoutes);
app.use("/api/physics", physicsRoutes);
app.use("/api/physicalchem", physicalChemRoutes);

// New platform routes
app.use("/api/quiz", quizRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/sessions", studySessionRoute);
app.use("/api/goals", goalRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/teacher", teacherControlRoute);
app.use("/api/announcements", announcementRoute);
app.use("/api/holidays", holidayRoute);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Start Server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
