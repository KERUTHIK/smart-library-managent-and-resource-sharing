import { Router } from "express";
import { returnController } from "../controllers/return.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate, authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN));

router.get("/active-loans", (req, res, next) => returnController.getActiveLoans(req, res, next));
router.get("/history", (req, res, next) => returnController.getRecentReturns(req, res, next));
router.post("/", (req, res, next) => returnController.processReturn(req, res, next));

export default router;
