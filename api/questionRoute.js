import express from "express";
import Question from "../model/FacultyQues.js";

const router = express.Router();

// Add a question
router.post("/add", async (req, res) => {
  try {
    const { userId, subject, chapter, difficulty, question } = req.body;

    // Validate request
    if (!userId || !subject || !chapter || !difficulty || !question) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newQuestion = new Question({
      FacultyId: userId,
      subject,
      chapter,
      difficulty,
      question,
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question added successfully" });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Failed to add question" });
  }
});

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().populate("FacultyId", "name email");
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;
