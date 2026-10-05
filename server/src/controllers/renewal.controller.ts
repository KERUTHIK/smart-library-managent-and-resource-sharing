import { Request, Response, NextFunction } from "express";
import { renewalService } from "../services/renewal.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class RenewalController {
  async requestRenewal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { borrowTransactionId, reason } = req.body;
      const result = await renewalService.requestRenewal(
        req.user.userId,
        borrowTransactionId,
        reason
      );
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async listRenewals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, status } = req.query;
      const renewals = await renewalService.listRenewals({
        departmentId: departmentId as string,
        status: status as string,
      });
      res.json({ success: true, renewals });
    } catch (error) {
      next(error);
    }
  }

  async processRenewal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { approved, reason } = req.body;
      const result = await renewalService.processRenewal(
        req.params.id as string,
        approved,
        req.user.userId,
        reason
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const renewalController = new RenewalController();
