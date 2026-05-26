import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    systemLabel: { type: String, default: "Growth Node" },
    icon: { type: String, default: "bolt" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
