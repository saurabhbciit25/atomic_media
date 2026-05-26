import express from "express";
import Service from "../models/Service.js";
import { create, list, remove, update } from "../controllers/crudFactory.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", list(Service, { active: true }));
router.get("/admin/all", protect, adminOnly, list(Service));
router.post("/", protect, adminOnly, create(Service));
router.put("/:id", protect, adminOnly, update(Service));
router.delete("/:id", protect, adminOnly, remove(Service));
export default router;
