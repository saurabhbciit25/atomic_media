import mongoose from "mongoose";

// Setup global mock database if it doesn't exist
if (!global.mockDb) {
  global.mockDb = {
    Project: [
      { _id: "mock-proj-1", title: "NEON_DRIFT", slug: "neon-drift", summary: "High-velocity brand and launch system.", category: "Strategy", tags: ["Branding", "Web Design"], progress: 72, featured: true, imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80" },
      { _id: "mock-proj-2", title: "VOID_SHELL", slug: "void-shell", summary: "AI-led content engine and creative operating system.", category: "Creative", tags: ["AI Integration"], progress: 45, featured: true, imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80" },
      { _id: "mock-proj-3", title: "CORE_SYNC", slug: "core-sync", summary: "B2B dashboard and analytics experience.", category: "Scaling", tags: ["UI/UX", "B2B"], progress: 89, featured: true, imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80" }
    ],
    Service: [
      { _id: "mock-serv-1", title: "Branding", slug: "branding", description: "Systemic identity systems that define industry standards.", systemLabel: "Systems Design", icon: "Fingerprint", order: 1 },
      { _id: "mock-serv-2", title: "Performance Marketing", slug: "performance-marketing", description: "Growth campaigns powered by data and real-time optimization.", systemLabel: "Growth Analytics", icon: "TrendingUp", order: 2 },
      { _id: "mock-serv-3", title: "AI Automation", slug: "ai-automation", description: "Bespoke LLM workflows for efficient operations.", systemLabel: "Neural Logistics", icon: "Cpu", order: 3 },
      { _id: "mock-serv-4", title: "Web Development", slug: "web-development", description: "High-performance digital foundations with modern stacks.", systemLabel: "Stack Engine", icon: "Code2", order: 4 }
    ],
    Message: [],
    SiteContent: [
      { _id: "mock-sc-1", key: "homepage", value: { headline: "WE CREATE BRANDS PEOPLE CAN'T IGNORE.", subheadline: "Atomic Media builds high-performance digital experiences powered by creativity, strategy, and AI.", cta: "Start the Project" } }
    ]
  };
}

function getMockStore(Model) {
  const name = Model.modelName;
  if (!global.mockDb[name]) {
    global.mockDb[name] = [];
  }
  return global.mockDb[name];
}

export const list = (Model, filter = {}) => async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(getMockStore(Model));
    }
    const items = await Model.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const create = (Model) => async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore(Model);
      const newItem = { _id: "mock-" + Date.now(), ...req.body, createdAt: new Date() };
      store.push(newItem);
      return res.status(201).json(newItem);
    }
    res.status(201).json(await Model.create(req.body));
  } catch (error) {
    next(error);
  }
};

export const update = (Model) => async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore(Model);
      const index = store.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: "Item not found" });
      store[index] = { ...store[index], ...req.body };
      return res.json(store[index]);
    }
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const remove = (Model) => async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore(Model);
      const index = store.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: "Item not found" });
      store.splice(index, 1);
      return res.json({ ok: true });
    }
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
