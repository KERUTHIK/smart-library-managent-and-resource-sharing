import { Router } from "express";
import { fineController } from "../controllers/fine.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

// Student routes
router.get("/my", authenticate, (req, res, next) => fineController.getMyFines(req, res, next));
router.get("/payments/my", authenticate, (req, res, next) => fineController.getMyPaymentHistory(req, res, next));
router.post("/pay", authenticate, (req, res, next) => fineController.payFine(req, res, next));

// Librarian / Admin routes
router.get(
  "/department",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => fineController.getDepartmentFines(req, res, next)
);

router.get(
  "/all",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => fineController.getAllFines(req, res, next)
);

router.get(
  "/",
  authenticate,
  (req: any, res, next) => {
    if (req.user?.role === UserRole.ADMIN) {
      return fineController.getAllFines(req, res, next);
    } else if (req.user?.role === UserRole.LIBRARIAN) {
      return fineController.getDepartmentFines(req, res, next);
    } else {
      return fineController.getMyFines(req, res, next);
    }
  }
);

router.post(
  "/:id/waive",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => fineController.waiveFine(req, res, next)
);

router.post(
  "/:id/cancel",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => fineController.cancelFine(req, res, next)
);

export default router;
