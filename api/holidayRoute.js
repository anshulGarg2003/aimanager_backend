import express from "express";
import HolidayRequest from "../model/HolidayRequest.js";

const router = express.Router();

router.post("/request", async (req, res) => {
  try {
    const { studentId, reason, fromDate, toDate } = req.body;
    if (!studentId || !reason || !fromDate || !toDate) {
      return res.status(400).json({ error: "studentId, reason, fromDate, and toDate are required" });
    }

    const holidayRequest = await HolidayRequest.create({
      studentId,
      reason,
      fromDate,
      toDate,
      status: "pending",
    });

    res.status(201).json(holidayRequest);
  } catch (error) {
    res.status(500).json({ error: "Failed to create holiday request" });
  }
});

router.get("/", async (req, res) => {
  try {
    const status = (req.query.status || "all").trim();
    const query = status === "all" ? {} : { status };
    const requests = await HolidayRequest.find(query)
      .populate("studentId", "name email grade school")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holiday requests" });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const requests = await HolidayRequest.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student holiday requests" });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status, teacherComment, reviewedBy } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await HolidayRequest.findByIdAndUpdate(
      req.params.id,
      { status, teacherComment: teacherComment || "", reviewedBy },
      { new: true }
    ).populate("studentId", "name email grade school");

    if (!request) {
      return res.status(404).json({ error: "Holiday request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to update holiday request" });
  }
});

export default router;
