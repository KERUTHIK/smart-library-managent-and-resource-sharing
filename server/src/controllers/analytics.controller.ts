import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class AnalyticsController {
  async getAdminDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const timeFilter = (req.query.timeFilter as any) || "7d";
      const stats = await analyticsService.getAdminDashboardStats(timeFilter);
      res.json({ success: true, ...stats });
    } catch (error) {
      next(error);
    }
  }

  async getLibrarianDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.query;
      const stats = await analyticsService.getLibrarianDashboardStats(
        departmentId as string
      );
      res.json({ success: true, ...stats });
    } catch (error) {
      next(error);
    }
  }

  async getStudentDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const stats = await analyticsService.getStudentDashboardStats(req.user.userId);
      res.json({ success: true, ...stats });
    } catch (error) {
      next(error);
    }
  }

  async getDemandForecast(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const forecast = await analyticsService.getDemandForecast();
      res.json({ success: true, forecast });
    } catch (error) {
      next(error);
    }
  }

  async getResourceOptimization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getResourceOptimization();
      res.json({ success: true, optimization: data });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
