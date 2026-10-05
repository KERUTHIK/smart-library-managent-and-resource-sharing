import { Request, Response, NextFunction } from "express";
import { fineService } from "../services/fine.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class FineController {
  async getMyFines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const fines = await fineService.getMyFines(req.user.userId);
      res.json({ success: true, fines });
    } catch (error) {
      next(error);
    }
  }

  async getMyPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const payments = await fineService.getMyPaymentHistory(req.user.userId);
      res.json({ success: true, payments });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentFines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { department, status } = req.query;
      const fines = await fineService.getDepartmentFines(
        department as string,
        status as string
      );
      res.json({ success: true, fines });
    } catch (error) {
      next(error);
    }
  }

  async getAllFines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, department, search } = req.query;
      const fines = await fineService.getAllFines({
        status: status as string,
        department: department as string,
        search: search as string,
      });
      res.json({ success: true, fines });
    } catch (error) {
      next(error);
    }
  }

  async payFine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await fineService.payFine(req.body, req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async waiveFine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { reason } = req.body;
      const result = await fineService.waiveFine(req.params.id as string, reason, req.user.name || "Librarian");
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async cancelFine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { reason } = req.body;
      const result = await fineService.cancelFine(req.params.id as string, reason, req.user.name || "Admin");
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const fineController = new FineController();
