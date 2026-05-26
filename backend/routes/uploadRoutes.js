import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
// Support both /api/upload and /api/upload/image
router.post("/", protect, adminOnly, upload.single("image"), uploadImage);
router.post("/image", protect, adminOnly, upload.single("image"), uploadImage);
export default router;
