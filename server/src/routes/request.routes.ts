import { Router } from "express";
import { requestController } from "../controllers/request.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

// Student / Member requests
router.post("/", authenticate, (req, res, next) => requestController.createRequest(req, res, next));
router.get("/my", authenticate, (req, res, next) => requestController.getMyRequests(req, res, next));
router.post("/:id/cancel", authenticate, (req, res, next) => requestController.cancelRequest(req, res, next));

// Librarian / Admin request queue management
router.get(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => requestController.getRequests(req, res, next)
);

router.post(
  "/:id/approve",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => requestController.approveRequest(req, res, next)
);

router.post(
  "/:id/reject",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => requestController.rejectRequest(req, res, next)
);

router.post(
  "/:id/issue",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => requestController.issueBook(req, res, next)
);

export default router;
