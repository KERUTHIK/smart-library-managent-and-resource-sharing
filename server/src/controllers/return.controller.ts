import { Request, Response, NextFunction } from "express";
import { returnService } from "../services/return.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { BookCondition } from "../constants/index.js";

export class ReturnController {
  async getActiveLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, department } = req.query;
      const loans = await returnService.getActiveBorrowings(
        department as string,
        search as string
      );
      res.json({ success: true, loans });
    } catch (error) {
      next(error);
    }
  }

  async processReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { borrowTransactionId, condition, notes } = req.body;
      const bookCondition =
        condition === "Damaged"
          ? BookCondition.DAMAGED
          : condition === "Lost"
          ? BookCondition.LOST
          : BookCondition.GOOD;

      const result = await returnService.processReturn(
        borrowTransactionId,
        bookCondition,
        req.user.name || "Librarian",
        req.user.userId,
        notes
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecentReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { department } = req.query;
      const returns = await returnService.getReturnHistory(department as string);
      res.json({ success: true, returns });
    } catch (error) {
      next(error);
    }
  }
}

export const returnController = new ReturnController();
