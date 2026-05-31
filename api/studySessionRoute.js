import express from "express";
import StudySession from "../model/StudySession.js";

const router = express.Router();

// ── START or LOG a study session ────────────────────────────────────────────
router.post("/start", async (req, res) => {
  try {
    const { userId, subject, chapter, topic, sessionType, date } = req.body;

    if (!userId || !subject || !date) {
      return res.status(400).json({ error: "userId, subject, and date are required" });
    }

    const session = new StudySession({
      userId,
      subject,
      chapter,
      topic,
      sessionType: sessionType || "study",
      startTime: new Date(),
      date,
    });

    await session.save();
    res.status(201).json({ message: "Session started", sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── END a study session ──────────────────────────────────────────────────────
router.put("/end/:sessionId", async (req, res) => {
  try {
    const { productivity, notes } = req.body;

    const session = await StudySession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    session.endTime = new Date();
    session.productivity = productivity;
    session.notes = notes;
    await session.save();

    res.json({ message: "Session ended", duration: session.duration, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOG a completed session directly (manual entry) ─────────────────────────
router.post("/log", async (req, res) => {
  try {
    const { userId, subject, chapter, topic, sessionType, startTime, endTime, productivity, notes, date } =
      req.body;

    if (!userId || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = new StudySession({
      userId,
      subject,
      chapter,
      topic,
      sessionType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      productivity,
      notes,
      date,
    });

    await session.save();
    res.status(201).json({ message: "Session logged", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET sessions for a user ──────────────────────────────────────────────────
router.get("/:userId", async (req, res) => {
  try {
    const { from, to, subject } = req.query;
    const filter = { userId: req.params.userId };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    if (subject) filter.subject = subject;

    const sessions = await StudySession.find(filter).sort({ date: -1, startTime: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET today's total study time ─────────────────────────────────────────────
router.get("/:userId/today/summary", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sessions = await StudySession.find({
      userId: req.params.userId,
      date: today,
    }).lean();

    const totalMinutes = sessions.reduce((s, sess) => s + (sess.duration || 0), 0);
    const bySubject = {};
    for (const s of sessions) {
      if (!bySubject[s.subject]) bySubject[s.subject] = 0;
      bySubject[s.subject] += s.duration || 0;
    }

    res.json({
      date: today,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      sessionCount: sessions.length,
      bySubject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
