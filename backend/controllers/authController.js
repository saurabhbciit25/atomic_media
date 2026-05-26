import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const bootstrapAdmin = {
  name: process.env.ADMIN_NAME || "Admin User",
  email: (process.env.ADMIN_EMAIL || "admin@atomic.media").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  role: "admin"
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

async function ensureFirstAdmin(email, password) {
  if (!email || !password) return null;
  const hasAdmin = await User.exists({ role: "admin" });
  if (hasAdmin) return null;
  if (email.toLowerCase() !== bootstrapAdmin.email || password !== bootstrapAdmin.password) return null;
  return User.create(bootstrapAdmin);
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Database offline fallback check
    if (mongoose.connection.readyState !== 1) {
      if (email.toLowerCase() === bootstrapAdmin.email && password === bootstrapAdmin.password) {
        const mockUser = {
          _id: "mock-admin-id",
          name: bootstrapAdmin.name,
          email: bootstrapAdmin.email,
          role: bootstrapAdmin.role
        };
        const token = jwt.sign(
          { id: mockUser._id, role: mockUser.role, mock: true },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );
        return res.json({
          token,
          user: mockUser,
          note: "Connected in offline developer fallback mode."
        });
      }
    }

    const user = await User.findOne({ email }).select("+password") || await ensureFirstAdmin(email, password);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Registration is unavailable when database is offline" });
    }
    const user = await User.create(req.body);
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
