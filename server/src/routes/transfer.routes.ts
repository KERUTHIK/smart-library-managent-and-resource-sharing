import { Router } from "express";
import { transferController } from "../controllers/transfer.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { UserRole } from "../constants/index.js";

const router = Router();

router.use(authenticate, authorizeRole(UserRole.ADMIN, UserRole.LIBRARIAN));

router.get("/", (req, res, next) => transferController.getTransfers(req, res, next));
router.post("/", (req, res, next) => transferController.requestTransfer(req, res, next));
router.post("/:id/dispatch", (req, res, next) => transferController.dispatchTransfer(req, res, next));
router.post("/:id/receive", (req, res, next) => transferController.receiveTransfer(req, res, next));
router.post("/:id/cancel", (req, res, next) => transferController.cancelTransfer(req, res, next));

export default router;
