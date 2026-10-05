import { Request, Response, NextFunction } from "express";
import { transferService } from "../services/transfer.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class TransferController {
  async getTransfers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, fromLibrary, toLibrary } = req.query;
      const transfers = await transferService.getTransfers({
        status: status as string,
        fromLibrary: fromLibrary as string,
        toLibrary: toLibrary as string,
      });
      res.json({ success: true, transfers });
    } catch (error) {
      next(error);
    }
  }

  async requestTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await transferService.requestTransfer(req.body, req.user.userId);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async dispatchTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await transferService.dispatchTransfer(
        req.params.id as string,
        req.body,
        req.user.userId
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async receiveTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { condition, shelfLocation } = req.body;
      const result = await transferService.receiveTransfer(
        req.params.id as string,
        condition,
        shelfLocation,
        req.user.userId
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async cancelTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { reason } = req.body;
      const result = await transferService.cancelTransfer(
        req.params.id as string,
        req.user.userId,
        reason
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const transferController = new TransferController();
