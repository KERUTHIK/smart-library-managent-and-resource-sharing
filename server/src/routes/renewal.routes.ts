import { Router } from "express";
import { renewalController } from "../controllers/renewal.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

// Student renews book
router.post("/", authenticate, (req, res, next) => renewalController.requestRenewal(req, res, next));

// Librarian reviews renewals
router.get(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => renewalController.listRenewals(req, res, next)
);

router.post(
  "/:id/process",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => renewalController.processRenewal(req, res, next)
);

export default router;
