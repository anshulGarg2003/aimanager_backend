import express from "express";
import Announcement from "../model/Announcement.js";

const router = express.Router();

router.get("/active", async (req, res) => {
  try {
    const audience = (req.query.audience || "student").trim();
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      audience: { $in: [audience, "all"] },
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active announcements" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, message, audience, level, isActive, startDate, endDate, createdBy } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      audience: audience || "student",
      level: level || "info",
      isActive: isActive !== false,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy,
      updatedBy: createdBy,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, message, audience, level, isActive, startDate, endDate, updatedBy } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        title,
        message,
        audience,
        level,
        isActive,
        startDate,
        endDate: endDate || null,
        updatedBy,
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
