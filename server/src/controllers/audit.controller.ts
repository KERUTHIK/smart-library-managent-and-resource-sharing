import { Request, Response, NextFunction } from "express";
import { auditService } from "../services/audit.service.js";

export class AuditController {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, actorType, entityType, limit, page } = req.query;
      const result = await auditService.getLogs({
        action: action as string,
        actorType: actorType as string,
        entityType: entityType as string,
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
