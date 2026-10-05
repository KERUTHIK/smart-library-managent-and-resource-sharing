import { Router } from "express";
import { ebookController } from "../controllers/ebook.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { uploadPdf } from "../middleware/upload.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.get("/", (req, res, next) => ebookController.getEBooks(req, res, next));
router.get("/:id", (req, res, next) => ebookController.getEBookById(req, res, next));

// Upload PDF and create E-Book
router.post(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  uploadPdf.single("file"),
  (req, res, next) => ebookController.uploadEBook(req, res, next)
);

// Extract metadata only
router.post(
  "/extract-metadata",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  uploadPdf.single("file"),
  (req, res, next) => ebookController.extractMetadata(req, res, next)
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => ebookController.deleteEBook(req, res, next)
);

export default router;
