import mongoose from "mongoose";
import Message from "../models/Message.js";

// Helper for offline store
function getMockStore() {
  if (!global.mockDb) {
    global.mockDb = {};
  }
  if (!global.mockDb.Message) {
    global.mockDb.Message = [];
  }
  return global.mockDb.Message;
}

export async function submitMessage(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore();
      const message = { _id: "mock-msg-" + Date.now(), ...req.body, createdAt: new Date() };
      store.push(message);
      return res.status(201).json({ ok: true, id: message._id });
    }
    const message = await Message.create(req.body);
    res.status(201).json({ ok: true, id: message._id });
  } catch (error) {
    next(error);
  }
}

export async function listMessages(_req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(getMockStore());
    }
    res.json(await Message.find().sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}

export async function updateMessage(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore();
      const index = store.findIndex((msg) => msg._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: "Message not found" });
      store[index] = { ...store[index], ...req.body };
      return res.json(store[index]);
    }
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    next(error);
  }
}

export async function deleteMessage(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      const store = getMockStore();
      const index = store.findIndex((msg) => msg._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: "Message not found" });
      store.splice(index, 1);
      return res.json({ ok: true });
    }
    await Message.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
