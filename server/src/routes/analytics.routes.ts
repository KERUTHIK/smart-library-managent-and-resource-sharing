import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate);

router.get("/admin", authorizeRole(UserRole.ADMIN), (req, res, next) =>
  analyticsController.getAdminDashboard(req, res, next)
);

router.get(
  "/librarian",
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => analyticsController.getLibrarianDashboard(req, res, next)
);

router.get("/student", (req, res, next) =>
  analyticsController.getStudentDashboard(req, res, next)
);

router.get(
  "/demand-forecast",
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => analyticsController.getDemandForecast(req, res, next)
);

router.get(
  "/resource-optimization",
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => analyticsController.getResourceOptimization(req, res, next)
);

export default router;
