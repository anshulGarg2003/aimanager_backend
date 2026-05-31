import express from "express";
import PhysicalChemistry from "../model/PhysicalChemistry.js";

const router = express.Router();

router.post("/add-chapter", async (req, res) => {
  try {
    const newChapter = new PhysicalChemistry(req.body);
    await newChapter.save();
    res.status(201).json({ message: "Chapter added successfully", data: newChapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/all-chapters", async (req, res) => {
  try {
    const chapters = await PhysicalChemistry.find();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const chapter = await PhysicalChemistry.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedChapter = await PhysicalChemistry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Chapter updated successfully", data: updatedChapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await PhysicalChemistry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
