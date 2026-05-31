import express from "express";
import QuizAttempt from "../model/QuizAttempt.js";
import StudySession from "../model/StudySession.js";
import Event from "../model/event.js";

const router = express.Router();

// ── OVERVIEW: overall stats for a user ─────────────────────────────────────
router.get("/overview/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [attempts, sessions] = await Promise.all([
      QuizAttempt.find({ userId }).lean(),
      StudySession.find({ userId }).lean(),
    ]);

    const totalQuizzes = attempts.length;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalQuizzes)
        : 0;
    const totalStudyMinutes = sessions.reduce((s, sess) => s + (sess.duration || 0), 0);
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

    // Subject-wise breakdown
    const subjectMap = {};
    for (const a of attempts) {
      if (!subjectMap[a.subject]) {
        subjectMap[a.subject] = { attempts: 0, totalScore: 0, totalMarks: 0 };
      }
      subjectMap[a.subject].attempts++;
      subjectMap[a.subject].totalScore += a.score;
      subjectMap[a.subject].totalMarks += a.totalMarks;
    }
    const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      attempts: data.attempts,
      avgScore: data.totalMarks > 0
        ? Math.round((data.totalScore / data.totalMarks) * 100)
        : 0,
    }));

    // Study hours by subject
    const studyBySubject = {};
    for (const sess of sessions) {
      if (!studyBySubject[sess.subject]) studyBySubject[sess.subject] = 0;
      studyBySubject[sess.subject] += sess.duration || 0;
    }
    const studyHoursPerSubject = Object.entries(studyBySubject).map(([subject, mins]) => ({
      subject,
      hours: Math.round((mins / 60) * 10) / 10,
    }));

    // Streak calculation (consecutive days with study sessions)
    const studyDates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let check = today;
    for (const date of studyDates) {
      if (date === check) {
        streak++;
        const d = new Date(check);
        d.setDate(d.getDate() - 1);
        check = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    // Identify weak subjects (avgScore < 50%)
    const weakSubjects = subjectPerformance
      .filter((s) => s.avgScore < 50 && s.attempts >= 1)
      .map((s) => s.subject);

    res.json({
      totalQuizzes,
      avgScore,
      totalStudyHours,
      currentStreak: streak,
      subjectPerformance,
      studyHoursPerSubject,
      weakSubjects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── WEEKLY PERFORMANCE: last 7 days quiz scores + study hours ───────────────
router.get("/weekly/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    const [attempts, sessions] = await Promise.all([
      QuizAttempt.find({
        userId,
        attemptedAt: { $gte: new Date(days[0]) },
      }).lean(),
      StudySession.find({
        userId,
        date: { $gte: days[0] },
      }).lean(),
    ]);

    const weekData = days.map((date) => {
      const dayAttempts = attempts.filter(
        (a) => a.attemptedAt.toISOString().split("T")[0] === date
      );
      const daySessions = sessions.filter((s) => s.date === date);

      const avgScore =
        dayAttempts.length > 0
          ? Math.round(
              dayAttempts.reduce((s, a) => s + a.percentage, 0) / dayAttempts.length
            )
          : null;

      const studyMinutes = daySessions.reduce((s, sess) => s + (sess.duration || 0), 0);

      return {
        date,
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        avgScore,
        studyHours: Math.round((studyMinutes / 60) * 10) / 10,
        quizzesAttempted: dayAttempts.length,
      };
    });

    res.json(weekData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SUBJECT DETAIL: chapter-wise performance for a subject ──────────────────
router.get("/subject/:userId", async (req, res) => {
  try {
    const { subject } = req.query;
    const userId = req.params.userId;

    if (!subject) return res.status(400).json({ error: "subject query param required" });

    const attempts = await QuizAttempt.find({ userId, subject }).lean();

    // Group by chapter
    const chapterMap = {};
    for (const a of attempts) {
      if (!chapterMap[a.chapter]) {
        chapterMap[a.chapter] = { attempts: [], totalScore: 0, totalMarks: 0 };
      }
      chapterMap[a.chapter].attempts.push(a);
      chapterMap[a.chapter].totalScore += a.score;
      chapterMap[a.chapter].totalMarks += a.totalMarks;
    }

    const chapters = Object.entries(chapterMap).map(([chapter, data]) => ({
      chapter,
      attempts: data.attempts.length,
      avgScore:
        data.totalMarks > 0
          ? Math.round((data.totalScore / data.totalMarks) * 100)
          : 0,
      lastAttempt: data.attempts.sort(
        (a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt)
      )[0]?.attemptedAt,
    }));

    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LEADERBOARD: top students by quiz average ───────────────────────────────
router.get("/leaderboard", async (req, res) => {
  try {
    const { subject, grade } = req.query;

    const matchStage = {};
    if (subject) matchStage.subject = subject;

    const leaderboard = await QuizAttempt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          totalMarks: { $sum: "$totalMarks" },
          attempts: { $sum: 1 },
        },
      },
      {
        $addFields: {
          avgPercentage: {
            $cond: [
              { $gt: ["$totalMarks", 0] },
              { $round: [{ $multiply: [{ $divide: ["$totalScore", "$totalMarks"] }, 100] }, 0] },
              0,
            ],
          },
        },
      },
      { $sort: { avgPercentage: -1, attempts: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          picture: "$user.picture",
          grade: "$user.grade",
          school: "$user.school",
          avgPercentage: 1,
          attempts: 1,
          totalScore: 1,
        },
      },
    ]);

    // Filter by grade after lookup if specified
    const filtered = grade
      ? leaderboard.filter((u) => u.grade === grade)
      : leaderboard;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
