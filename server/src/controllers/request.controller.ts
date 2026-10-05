import { Request, Response, NextFunction } from "express";
import { requestService } from "../services/request.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class RequestController {
  async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { bookId } = req.body;
      if (!bookId) throw new AppError("Book ID is required", 400);

      const result = await requestService.createBorrowRequest(req.user.userId, bookId);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { department, status } = req.query;
      const requests = await requestService.getDepartmentRequests(
        department as string,
        status as string
      );
      res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const requests = await requestService.getMyRequests(req.user.userId);
      res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  async approveRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await requestService.approveRequest(
        req.params.id as string,
        req.user.name || "Librarian"
      );
      res.json({ success: true, request: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { reason } = req.body;
      const result = await requestService.rejectRequest(
        req.params.id as string,
        reason
      );
      res.json({ success: true, request: result });
    } catch (error) {
      next(error);
    }
  }

  async cancelRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await requestService.cancelRequest(req.params.id as string, req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async issueBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { copyId } = req.body;
      const result = await requestService.issueBook(req.params.id as string, req.user.userId, copyId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();
