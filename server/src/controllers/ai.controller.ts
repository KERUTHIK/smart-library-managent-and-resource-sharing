import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/ai.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class AIController {
  async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { bookId } = req.query;
      const conversation = await aiService.getOrCreateConversation(
        req.user.userId,
        bookId as string
      );
      res.json({ success: true, ...conversation });
    } catch (error) {
      next(error);
    }
  }

  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { content, query, conversationId, bookContextId } = req.body;
      const userText = content || query;

      const message = await aiService.chat(
        req.user.userId,
        userText,
        conversationId,
        bookContextId
      );
      res.json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await aiService.clearHistory(req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
