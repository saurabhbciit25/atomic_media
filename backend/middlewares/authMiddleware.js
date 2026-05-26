import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If the database is offline or the token is marked as mock, bypass database lookups
    if (decoded.mock || mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id || "mock-admin-id",
        name: decoded.name || "Admin User",
        email: decoded.email || "admin@atomic.media",
        role: decoded.role || "admin"
      };
      return next();
    }

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}
