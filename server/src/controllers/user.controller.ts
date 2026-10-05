import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { AppError } from "../middleware/errorHandler.js";

export class UserController {
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { dept, type, status, search } = req.query;
      const members = await userService.getMembers({
        dept: dept as string,
        type: type as string,
        status: status as string,
        search: search as string,
      });
      res.json({ success: true, members });
    } catch (error) {
      next(error);
    }
  }

  async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await userService.createMember(req.body);
      res.status(201).json({ success: true, member });
    } catch (error) {
      next(error);
    }
  }

  async toggleSuspension(req: Request, res: Response, next: NextFunction) {
    try {
      const { suspend, reason } = req.body;
      const result = await userService.toggleSuspension(req.params.id as string, suspend, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async importCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new AppError("Invalid or empty CSV rows provided", 400);
      }
      const result = await userService.importMembers(rows);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
