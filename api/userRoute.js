import express from "express";
import User from "../model/User.js";
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { auth0Id, name, email, picture } = req.body;

    let user = await User.findOne({ auth0Id }); // Use findOne() and await

    if (!user) {
      user = new User({ auth0Id, name, email, picture });
      await user.save();
    }

    res.status(200).json(user); // Return the user whether newly created or existing
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    let user = await User.find({}); // Use findOne() and await

    res.status(200).json(user); // Return the user whether newly created or existing
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:userId/addTask", async (req, res) => {
  try {
    const { taskId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { tasks: taskId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
});

router.put("/:userId/addeduinfo", async (req, res) => {
  try {
    const { school, grade } = req.body; // Receive school and grade
    console.log(req.body);
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { school, grade }, // Directly update school and grade
      { new: true }
    );
    console.log(user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update education info" });
  }
});

router.put("/:userId/profile", async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "picture",
      "phone",
      "bio",
      "school",
      "grade",
      "subjects",
      "department",
      "qualification",
      "yearsExperience",
      "teacherCode",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (typeof updates.name === "string") updates.name = updates.name.trim();
    if (typeof updates.phone === "string") updates.phone = updates.phone.trim();
    if (typeof updates.bio === "string") updates.bio = updates.bio.trim();
    if (typeof updates.school === "string") updates.school = updates.school.trim();
    if (typeof updates.grade === "string") updates.grade = updates.grade.trim();
    if (typeof updates.department === "string") updates.department = updates.department.trim();
    if (typeof updates.qualification === "string") updates.qualification = updates.qualification.trim();
    if (typeof updates.teacherCode === "string") updates.teacherCode = updates.teacherCode.trim();

    if (Array.isArray(updates.subjects)) {
      updates.subjects = updates.subjects
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);
    }

    if (Object.prototype.hasOwnProperty.call(updates, "yearsExperience")) {
      const parsedYears = Number(updates.yearsExperience);
      updates.yearsExperience = Number.isFinite(parsedYears) && parsedYears >= 0 ? parsedYears : 0;
    }

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
