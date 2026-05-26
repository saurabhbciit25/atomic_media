import mongoose from "mongoose";
import SiteContent from "../models/SiteContent.js";

// Helper for offline store
function getMockStore() {
  if (!global.mockDb) {
    global.mockDb = {};
  }
  if (!global.mockDb.SiteContent) {
    global.mockDb.SiteContent = [
      { key: "homepage", value: { headline: "WE CREATE BRANDS PEOPLE CAN'T IGNORE.", subheadline: "Atomic Media builds high-performance digital experiences powered by creativity, strategy, and AI.", cta: "Start the Project" } }
    ];
  }
  return global.mockDb.SiteContent;
}

export async function getContent(_req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const rows = getMockStore();
      return res.json(rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}));
    }
    const rows = await SiteContent.find();
    res.json(rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}));
  } catch (error) {
    next(error);
  }
}

export async function getContentByKey(req, res, next) {
  try {
    const { key } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const row = getMockStore().find((r) => r.key === key);
      return res.json(row || { key, value: {} });
    }
    const row = await SiteContent.findOne({ key });
    res.json(row || { key, value: {} });
  } catch (error) {
    next(error);
  }
}

export async function upsertContent(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore();
      const updates = Object.entries(req.body).map(([key, value]) => {
        let row = store.find((r) => r.key === key);
        if (row) {
          row.value = value;
        } else {
          row = { _id: "mock-" + Date.now(), key, value };
          store.push(row);
        }
        return row;
      });
      return res.json(updates);
    }
    const updates = await Promise.all(
      Object.entries(req.body).map(([key, value]) =>
        SiteContent.findOneAndUpdate({ key }, { value }, { new: true, upsert: true })
      )
    );
    res.json(updates);
  } catch (error) {
    next(error);
  }
}

export async function upsertContentByKey(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore();
      let row = store.find((r) => r.key === key);
      if (row) {
        row.value = value;
      } else {
        row = { _id: "mock-" + Date.now(), key, value };
        store.push(row);
      }
      return res.json(row);
    }
    const row = await SiteContent.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
    res.json(row);
  } catch (error) {
    next(error);
  }
}

