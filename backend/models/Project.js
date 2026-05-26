import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Creative" },
    tags: [{ type: String }],
    imageUrl: { type: String, default: "" },
    client: { type: String, default: "" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
