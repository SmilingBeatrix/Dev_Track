import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", maxlength: 1000 },
  color: { type: String, default: "#7c6cf2" },
  status: { type: String, enum: ["active", "on-hold", "completed"], default: "active" },
  dueDate: { type: Date, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
