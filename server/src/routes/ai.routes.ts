import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/conversation", (req, res, next) => aiController.getConversation(req, res, next));
router.post("/chat", (req, res, next) => aiController.chat(req, res, next));
router.delete("/history", (req, res, next) => aiController.clearHistory(req, res, next));

export default router;
