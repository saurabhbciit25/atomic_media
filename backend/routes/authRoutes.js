import express from "express";
import { login, me, register } from "../controllers/authController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", protect, adminOnly, register);
router.get("/me", protect, me);
export default router;
