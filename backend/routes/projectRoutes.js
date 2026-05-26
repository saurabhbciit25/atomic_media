import express from "express";
import Project from "../models/Project.js";
import { create, list, remove, update } from "../controllers/crudFactory.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", list(Project));
router.post("/", protect, adminOnly, create(Project));
router.put("/:id", protect, adminOnly, update(Project));
router.delete("/:id", protect, adminOnly, remove(Project));
export default router;
