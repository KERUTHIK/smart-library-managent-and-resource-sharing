import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

// Public / Authenticated catalog reading
router.get("/", (req, res, next) => bookController.getBooks(req, res, next));
router.get("/popular", (req, res, next) => bookController.getPopularBooks(req, res, next));
router.post("/check-duplicate", authenticate, (req, res, next) => bookController.checkDuplicate(req, res, next));
router.get("/:id", (req, res, next) => bookController.getBookById(req, res, next));

// Librarian / Admin book mutations
router.post(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => bookController.createBook(req, res, next)
);

router.put(
  "/:id",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => bookController.updateBook(req, res, next)
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => bookController.deleteBook(req, res, next)
);

router.post(
  "/:id/copies",
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN),
  (req, res, next) => bookController.addCopy(req, res, next)
);

export default router;
