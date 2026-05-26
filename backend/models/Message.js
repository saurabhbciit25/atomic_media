import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    company: { type: String, default: "" },
    subject: { type: String, default: "New project inquiry" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "archived"], default: "new" }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
