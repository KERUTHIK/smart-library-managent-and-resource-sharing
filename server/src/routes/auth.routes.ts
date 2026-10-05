import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/index.js";

const router = Router();

router.post("/login", validateBody(loginSchema), (req, res, next) => authController.login(req, res, next));
router.get("/me", authenticate, (req, res, next) => authController.me(req, res, next));
router.post("/register", validateBody(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post("/change-password", authenticate, (req, res, next) => authController.changePassword(req, res, next));

export default router;
