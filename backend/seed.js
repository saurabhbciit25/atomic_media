import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Service from "./models/Service.js";
import SiteContent from "./models/SiteContent.js";

dotenv.config();
await connectDB();

try {
  console.log("Cleaning existing collections...");
  await User.deleteMany();
  await Project.deleteMany();
  await Service.deleteMany();
  await SiteContent.deleteMany();

  console.log("Creating default administrator...");
  await User.create({
    name: "Admin User",
    email: "admin@atomic.media",
    password: "ChangeMe123!",
    role: "admin"
  });

  console.log("Creating default services...");
  await Service.insertMany([
    { title: "Branding", slug: "branding", description: "Systemic identity systems that define industry standards.", systemLabel: "Systems Design", icon: "Fingerprint", order: 1 },
    { title: "Performance Marketing", slug: "performance-marketing", description: "Growth campaigns powered by data and real-time optimization.", systemLabel: "Growth Analytics", icon: "TrendingUp", order: 2 },
    { title: "AI Automation", slug: "ai-automation", description: "Bespoke LLM workflows for efficient operations.", systemLabel: "Neural Logistics", icon: "Cpu", order: 3 },
    { title: "Web Development", slug: "web-development", description: "High-performance digital foundations with modern stacks.", systemLabel: "Stack Engine", icon: "Code2", order: 4 }
  ]);

  console.log("Creating default portfolio projects...");
  await Project.insertMany([
    { title: "NEON_DRIFT", slug: "neon-drift", summary: "High-velocity brand and launch system.", category: "Strategy", tags: ["Branding", "Web Design"], progress: 72, featured: true, imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80" },
    { title: "VOID_SHELL", slug: "void-shell", summary: "AI-led content engine and creative operating system.", category: "Creative", tags: ["AI Integration"], progress: 45, featured: true, imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80" },
    { title: "CORE_SYNC", slug: "core-sync", summary: "B2B dashboard and analytics experience.", category: "Scaling", tags: ["UI/UX", "B2B"], progress: 89, featured: true, imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80" }
  ]);

  console.log("Creating site configurations...");
  await SiteContent.create({
    key: "homepage",
    value: {
      headline: "WE CREATE BRANDS PEOPLE CAN'T IGNORE.",
      subheadline: "Atomic Media builds high-performance digital experiences powered by creativity, strategy, and AI.",
      cta: "Start the Project"
    }
  });

  console.log("Seeding process completed successfully!");
  console.log("-----------------------------------------");
  console.log("👤 Admin Username: admin@atomic.media");
  console.log("🔑 Password: ChangeMe123!");
  console.log("-----------------------------------------");
  process.exit(0);
} catch (error) {
  console.error("Seeding failed with error:", error.message);
  process.exit(1);
}
