import { Router } from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/authe.js";

const router = Router();
router.use(requireAuth);
router.get("/", async (req, res, next) => {
  try {
    const [projects, tasks, recentTasks, overdue] = await Promise.all([
      Project.countDocuments({ owner: req.userId }),
      Task.countDocuments({ owner: req.userId }),
      Task.find({ owner: req.userId })
        .populate("project", "name color")
        .sort({ updatedAt: -1 })
        .limit(6),
      Task.countDocuments({
        owner: req.userId,
        status: { $ne: "done" },
        dueDate: { $lt: new Date() },
      }),
    ]);
    const [done, inProgress, todo, activeProjects] = await Promise.all([
      Task.countDocuments({ owner: req.userId, status: "done" }),
      Task.countDocuments({ owner: req.userId, status: "in-progress" }),
      Task.countDocuments({ owner: req.userId, status: "todo" }),
      Project.countDocuments({ owner: req.userId, status: "active" }),
    ]);
    res.json({
      stats: {
        projects,
        tasks,
        done,
        inProgress,
        todo,
        overdue,
        activeProjects,
        completionRate: tasks ? Math.round((done / tasks) * 100) : 0,
      },
      recentTasks,
    });
  } catch (e) {
    next(e);
  }
});
export default router;
