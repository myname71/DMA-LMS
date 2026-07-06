import { Router } from "express";
import { register, login, logout, me, refreshToken, changePassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/jwtAuthMiddleware";

const router = Router();

/**
 * Public routes (no authentication required)
 */
router.post("/register", register);
router.post("/login", login);

/**
 * Protected routes (authentication required)
 */
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);
router.post("/refresh", authMiddleware, refreshToken);
router.post("/change-password", authMiddleware, changePassword);

export default router;
