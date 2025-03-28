import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import moment from "moment";
import eventRoute from "./api/eventRoute.js";
import userRoute from "./api/userRoute.js";
import chapterRoute from "./api/chapterRoute.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173/" }, // Allow React frontend
});

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

// Start Server
server.listen(5001, () => {
  console.log("🚀 Server running on port 5001");
});
