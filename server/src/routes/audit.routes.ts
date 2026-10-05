import { Router } from "express";
import { auditController } from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate, authorizeRole(UserRole.ADMIN));

router.get("/", (req, res, next) => auditController.getLogs(req, res, next));

export default router;
