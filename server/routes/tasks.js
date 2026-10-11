import { Router } from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { requireAuth } from "../middleware/authe.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const query = { owner: req.userId };
    if (req.query.project) query.project = req.query.project;
    if (
      req.query.status &&
      ["todo", "in-progress", "done"].includes(req.query.status)
    )
      query.status = req.query.status;
    if (
      req.query.priority &&
      ["low", "medium", "high"].includes(req.query.priority)
    )
      query.priority = req.query.priority;
    if (req.query.search)
      query.title = {
        $regex: String(req.query.search)
          .slice(0, 80)
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    const tasks = await Task.find(query)
      .populate("project", "name color")
      .sort({ updatedAt: -1 })
      .limit(200);
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title)
      return res.status(400).json({ message: "Task title is required." });
    const project = await Project.findOne({
      _id: req.body.project,
      owner: req.userId,
    });
    if (!project)
      return res.status(400).json({ message: "Choose a valid project." });
    const task = await Task.create({
      title,
      description: req.body.description || "",
      status: req.body.status || "todo",
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || null,
      project: project._id,
      owner: req.userId,
    });
    res.status(201).json(await task.populate("project", "name color"));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const allowed = ["title", "description", "status", "priority", "dueDate"];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k)),
    );
    if (req.body.project) {
      const project = await Project.findOne({
        _id: req.body.project,
        owner: req.userId,
      });
      if (!project)
        return res.status(400).json({ message: "Choose a valid project." });
      update.project = project._id;
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      update,
      { new: true, runValidators: true },
    ).populate("project", "name color");
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted." });
  } catch (e) {
    next(e);
  }
});
export default router;
