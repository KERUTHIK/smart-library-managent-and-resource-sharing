import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", (req, res, next) => notificationController.getNotifications(req, res, next));
router.patch("/:id/read", (req, res, next) => notificationController.markAsRead(req, res, next));
router.post("/mark-all-read", (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.delete("/:id", (req, res, next) => notificationController.deleteNotification(req, res, next));

export default router;
