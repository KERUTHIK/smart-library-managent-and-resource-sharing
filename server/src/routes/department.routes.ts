import { Router } from "express";
import { departmentController } from "../controllers/department.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

// Public / Authenticated list of departments
router.get("/", (req, res, next) => departmentController.getDepartments(req, res, next));

// Admin modifications
router.post(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => departmentController.createDepartment(req, res, next)
);

router.put(
  "/:id",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => departmentController.updateDepartment(req, res, next)
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  (req, res, next) => departmentController.deleteDepartment(req, res, next)
);

export default router;
