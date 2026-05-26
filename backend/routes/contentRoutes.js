import express from "express";
import { getContent, getContentByKey, upsertContent, upsertContentByKey } from "../controllers/contentController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
// Get all content or by key
router.get("/", getContent);
router.get("/:key", getContentByKey);
// Update content — full map or by key
router.put("/", protect, adminOnly, upsertContent);
router.put("/:key", protect, adminOnly, upsertContentByKey);
export default router;
