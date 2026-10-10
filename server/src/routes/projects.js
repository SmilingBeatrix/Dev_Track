import { Router } from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.userId }).sort({ updatedAt: -1 }).lean();
    const ids = projects.map(p => p._id);
    const counts = await Task.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.userId), project: { $in: ids } } },
      { $group: { _id: { project: "$project", status: "$status" }, count: { $sum: 1 } } }
    ]);
    const byProject = {};
    counts.forEach(c => { const id = String(c._id.project); byProject[id] ||= { total: 0, done: 0 }; byProject[id].total += c.count; if (c._id.status === "done") byProject[id].done += c.count; });
    res.json(projects.map(p => ({ ...p, progress: byProject[String(p._id)]?.total ? Math.round(byProject[String(p._id)].done / byProject[String(p._id)].total * 100) : 0, taskCount: byProject[String(p._id)]?.total || 0 })));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Project name is required." });
    const project = await Project.create({ name, description: req.body.description || "", color: req.body.color || "#7c6cf2", dueDate: req.body.dueDate || null, status: req.body.status || "active", owner: req.userId });
    res.status(201).json(project);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.userId });
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json(project);
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const allowed = ["name", "description", "color", "status", "dueDate"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, update, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json(project);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!project) return res.status(404).json({ message: "Project not found." });
    await Task.deleteMany({ project: project._id, owner: req.userId });
    res.json({ message: "Project and its tasks deleted." });
  } catch (e) { next(e); }
});
export default router;
