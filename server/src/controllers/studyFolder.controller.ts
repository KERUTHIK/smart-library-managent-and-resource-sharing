import { Request, Response, NextFunction } from "express";
import { studyFolderService } from "../services/studyFolder.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class StudyFolderController {
  async getFolders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const folders = await studyFolderService.getFolders(req.user.userId);
      res.json({ success: true, folders });
    } catch (error) {
      next(error);
    }
  }

  async createFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const folder = await studyFolderService.createFolder(req.user.userId, req.body);
      res.status(201).json({ success: true, folder });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await studyFolderService.deleteFolder(req.params.id as string, req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async addBookToFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { bookId, isEbook } = req.body;
      const result = await studyFolderService.addBookToFolder(
        req.params.id as string,
        req.user.userId,
        bookId,
        isEbook
      );
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async removeBookFromFolder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await studyFolderService.removeBookFromFolder(
        req.params.id as string,
        req.params.itemId as string,
        req.user.userId
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const note = await studyFolderService.addNote(
        req.params.id as string,
        req.user.userId,
        req.body
      );
      res.status(201).json({ success: true, note });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await studyFolderService.deleteNote(req.params.noteId as string, req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { ebookId } = req.query;
      const bookmarks = await studyFolderService.getBookmarks(
        req.user.userId,
        ebookId as string
      );
      res.json({ success: true, bookmarks });
    } catch (error) {
      next(error);
    }
  }

  async addBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const { ebookId, title, pageNumber, note } = req.body;
      const bookmark = await studyFolderService.addBookmark(req.user.userId, ebookId as string, {
        title,
        pageNumber,
        note,
      });
      res.status(201).json({ success: true, bookmark });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Not authenticated", 401);
      const result = await studyFolderService.deleteBookmark(req.params.id as string, req.user.userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const studyFolderController = new StudyFolderController();
