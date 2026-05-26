import express from "express";
import { deleteMessage, listMessages, submitMessage, updateMessage } from "../controllers/messageController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", submitMessage);
router.get("/", protect, adminOnly, listMessages);
router.put("/:id", protect, adminOnly, updateMessage);
router.delete("/:id", protect, adminOnly, deleteMessage);
export default router;
