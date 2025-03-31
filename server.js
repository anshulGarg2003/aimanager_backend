import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import eventRoute from "./api/eventRoute.js";
import userRoute from "./api/userRoute.js";
import chapterRoute from "./api/chapterRoute.js";
import questionRoute from "./api/questionRoute.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());
// console.log("MONGODB_URI", process.env.MONGODB_URI);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api", eventRoute);
app.use("/api/users", userRoute);
app.use("/api/schedule", chapterRoute);
app.use("/api/questions", questionRoute);

// Start Server
server.listen(5001, () => {
  console.log("🚀 Server running on port 5001");
});
