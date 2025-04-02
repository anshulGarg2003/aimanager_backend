import express from "express";
import Physics from "../model/Physics.js";

const router = express.Router();

// ✅ Add a new chapter
router.post("/add-chapter", async (req, res) => {
  try {
    const newChapter = new Physics(req.body);
    // console.log(newChapter);
    await newChapter.save();
    res
      .status(201)
      .json({ message: "Chapter added successfully", data: newChapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get all chapters
router.get("/all-chapters", async (req, res) => {
  try {
    const chapters = await Physics.find();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get a chapter by ID
router.get("/:id", async (req, res) => {
  try {
    const chapter = await Physics.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a chapter by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedChapter = await Physics.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Chapter updated successfully", data: updatedChapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Delete a chapter by ID
router.delete("/:id", async (req, res) => {
  try {
    await Physics.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
