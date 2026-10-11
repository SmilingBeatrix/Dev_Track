import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authe.js";

const router = Router();
const tokenFor = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2)
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Enter a valid email." });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    if (await User.exists({ email }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({ email }).select("+password");
    if (
      !user ||
      !(await bcrypt.compare(String(req.body.password || ""), user.password))
    ) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
export default router;
