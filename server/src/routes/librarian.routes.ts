import { Router } from "express";
import { librarianController } from "../controllers/librarian.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate, authorizeRole(UserRole.ADMIN));

router.get("/", (req, res, next) => librarianController.getLibrarians(req, res, next));
router.post("/", (req, res, next) => librarianController.createLibrarian(req, res, next));
router.put("/:id", (req, res, next) => librarianController.updateLibrarian(req, res, next));
router.patch("/:id/status", (req, res, next) => librarianController.toggleStatus(req, res, next));

export default router;
