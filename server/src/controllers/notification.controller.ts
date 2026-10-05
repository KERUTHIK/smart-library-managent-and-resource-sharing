import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const unreadOnly = req.query.filter === "unread";
      const notifications = await notificationService.getUserNotifications(
        req.user.userId,
        unreadOnly
      );
      res.json({ success: true, notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await notificationService.markAsRead(req.params.id as string, req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await notificationService.markAllAsRead(req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await notificationService.deleteNotification(
        req.params.id as string,
        req.user.userId
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
