import express from "express";
import Quiz from "../model/Quiz.js";
import QuizAttempt from "../model/QuizAttempt.js";

const router = express.Router();

// ── CREATE a quiz (admin/faculty only) ──────────────────────────────────────
router.post("/create", async (req, res) => {
  try {
    const { createdBy, title, subject, chapter, description, questions, duration, difficulty, grade } =
      req.body;

    if (!createdBy || !title || !subject || !chapter || !questions?.length || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const quiz = new Quiz({
      createdBy,
      title,
      subject,
      chapter,
      description,
      questions,
      duration,
      difficulty,
      grade,
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET all quizzes (optionally filter by subject/grade) ────────────────────
router.get("/", async (req, res) => {
  try {
    const { subject, grade, chapter, difficulty } = req.query;
    const filter = { isActive: true };
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter).select("-questions.options.isCorrect").lean();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET all attempts by a user ──────────────────────────────────────────────
router.get("/attempts/:userId", async (req, res) => {
  try {
    const { subject, limit = 20 } = req.query;
    const filter = { userId: req.params.userId };
    if (subject) filter.subject = subject;

    const attempts = await QuizAttempt.find(filter)
      .sort({ attemptedAt: -1 })
      .limit(parseInt(limit))
      .populate("quizId", "title subject chapter difficulty")
      .lean();

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET a single quiz (with correct answers hidden) ─────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Hide correct answers before sending to client
    const sanitized = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options.map(({ text, _id }) => ({ text, _id })),
      })),
    };
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SUBMIT a quiz attempt ───────────────────────────────────────────────────
router.post("/:id/submit", async (req, res) => {
  try {
    const { userId, answers, timeTaken } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({ error: "userId and answers are required" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Grade each answer
    let score = 0;
    const gradedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const selectedOption = userAnswer?.selectedOption;
      const isCorrect =
        selectedOption !== undefined &&
        selectedOption !== null &&
        question.options[selectedOption]?.isCorrect === true;
      const marksAwarded = isCorrect ? question.marks || 1 : 0;
      score += marksAwarded;

      return {
        questionId: question._id,
        selectedOption: selectedOption ?? null,
        isCorrect,
        marksAwarded,
      };
    });

    const attempt = new QuizAttempt({
      userId,
      quizId: quiz._id,
      subject: quiz.subject,
      chapter: quiz.chapter,
      answers: gradedAnswers,
      score,
      totalMarks: quiz.totalMarks,
      timeTaken,
    });

    await attempt.save();

    // Return result WITH correct answers for review
    const result = {
      score,
      totalMarks: quiz.totalMarks,
      percentage: attempt.percentage,
      attemptId: attempt._id,
      questions: quiz.questions.map((q, i) => ({
        questionText: q.questionText,
        explanation: q.explanation,
        selectedOption: answers[i]?.selectedOption ?? null,
        correctOption: q.options.findIndex((o) => o.isCorrect),
        isCorrect: gradedAnswers[i].isCorrect,
        options: q.options.map((o) => o.text),
      })),
    };

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a quiz ───────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
