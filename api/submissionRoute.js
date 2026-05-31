import express from "express";
import Submission from "../model/Submission.js";

const router = express.Router();

// Student submits handwritten answer
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      subject,
      imageUrl,
      answerPdfDataUrl,
      answerPageImages,
      pageCount,
    } = req.body;

    if (!userId || !subject || (!imageUrl && !answerPdfDataUrl)) {
      return res.status(400).json({
        error: "userId, subject and at least one of imageUrl or answerPdfDataUrl are required",
      });
    }

    if (answerPageImages && !Array.isArray(answerPageImages)) {
      return res.status(400).json({
        error: "answerPageImages must be an array when provided",
      });
    }

    if (pageCount && Number(pageCount) < 1) {
      return res.status(400).json({
        error: "pageCount must be at least 1",
      });
    }

    const submission = new Submission(req.body);
    await submission.save();

    res.status(201).json({ message: "Submission created", submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student view their submissions
router.get("/student/:userId", async (req, res) => {
  try {
    const { status, subject } = req.query;
    const filter = { userId: req.params.userId };

    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .lean();

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher review queue
router.get("/teacher/queue", async (req, res) => {
  try {
    const { status = "pending", subject } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (subject) filter.subject = subject;

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: 1 })
      .populate("userId", "name email grade school")
      .lean();

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher marks and reviews a submission
router.put("/:submissionId/review", async (req, res) => {
  try {
    const {
      status = "reviewed",
      marks,
      totalMarks,
      feedback,
      reviewedBy,
      reviewedPdfDataUrl,
    } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        status,
        marks,
        totalMarks,
        feedback,
        reviewedBy,
        reviewedPdfDataUrl,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({ message: "Submission reviewed", submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
