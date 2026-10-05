import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate, authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN));

router.get("/members", (req, res, next) => userController.getMembers(req, res, next));
router.post("/members", (req, res, next) => userController.createMember(req, res, next));
router.patch("/:id/suspension", (req, res, next) => userController.toggleSuspension(req, res, next));
router.post("/import-csv", (req, res, next) => userController.importCsv(req, res, next));

export default router;
