import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

// Resolve paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
connectDB();

const app = express();

// Set security headers (excluding directives that block script/video loadings locally)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Apply rate limiting (generous for local dev and testing)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

// Database connection check middleware (Ensure database is online for live endpoints)
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && req.path !== "/api/health" && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database connection is offline. Please check your cloud configuration.",
      dbError: global.dbError || "No active connection to MongoDB Atlas"
    });
  }
  next();
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "atomic-media-api",
    dbConnected: mongoose.connection.readyState === 1,
    dbError: global.dbError || null
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/upload", uploadRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Fallback to index.html for undefined frontend routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`===============================================`);
  console.log(`🚀 Atomic Media server initialized on port ${port}`);
  console.log(`📍 Main App: http://localhost:${port}`);
  console.log(`🛡️ Admin Page: http://localhost:${port}/admin.html`);
  console.log(`===============================================`);
});
