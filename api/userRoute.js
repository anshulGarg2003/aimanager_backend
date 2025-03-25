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

export default router;
