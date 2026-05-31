import express from "express";
import StudyGoal from "../model/StudyGoal.js";

const router = express.Router();

// ── CREATE a goal ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { userId, title, description, subject, goalType, targetValue, unit, deadline, milestones, priority } =
      req.body;

    if (!userId || !title || !goalType || targetValue === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const goal = new StudyGoal({
      userId,
      title,
      description,
      subject,
      goalType,
      targetValue,
      unit,
      deadline,
      milestones,
      priority,
    });

    await goal.save();
    res.status(201).json({ message: "Goal created", goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET all goals for a user ─────────────────────────────────────────────────
router.get("/:userId", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.params.userId };
    if (status) filter.status = status;

    const goals = await StudyGoal.find(filter).sort({ createdAt: -1 }).lean();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE goal progress ─────────────────────────────────────────────────────
router.put("/:goalId/progress", async (req, res) => {
  try {
    const { currentValue } = req.body;

    const goal = await StudyGoal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    goal.currentValue = currentValue;

    if (currentValue >= goal.targetValue && goal.status === "active") {
      goal.status = "completed";
      goal.completedAt = new Date();
    }

    await goal.save();
    res.json({ message: "Progress updated", goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── COMPLETE a milestone ─────────────────────────────────────────────────────
router.put("/:goalId/milestone/:milestoneId", async (req, res) => {
  try {
    const goal = await StudyGoal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ error: "Milestone not found" });

    milestone.isCompleted = true;
    milestone.completedAt = new Date();
    await goal.save();

    res.json({ message: "Milestone completed", goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE goal status ───────────────────────────────────────────────────────
router.put("/:goalId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const goal = await StudyGoal.findByIdAndUpdate(
      req.params.goalId,
      { status },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json({ message: "Status updated", goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a goal ────────────────────────────────────────────────────────────
router.delete("/:goalId", async (req, res) => {
  try {
    await StudyGoal.findByIdAndDelete(req.params.goalId);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
