import { Request, Response, NextFunction } from "express";
import { ebookService } from "../services/ebook.service.js";
import { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class EBookController {
  async getEBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, department, subject, sort } = req.query;
      const ebooks = await ebookService.getEBooks({
        search: search as string,
        department: department as string,
        subject: (subject || category) as string,
        sortBy: sort as string,
      });
      res.json({ success: true, ...ebooks });
    } catch (error) {
      next(error);
    }
  }

  async getEBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const ebook = await ebookService.getEBookById(req.params.id as string);
      res.json({ success: true, ebook });
    } catch (error) {
      next(error);
    }
  }

  async uploadEBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No PDF or EPUB file uploaded", 400);
      }

      const ebook = await ebookService.createEBookWithFile(
        req.file,
        req.body,
        req.user?.userId
      );
      res.status(201).json({ success: true, ebook });
    } catch (error) {
      next(error);
    }
  }

  async extractMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No PDF file uploaded for extraction", 400);
      }
      const metadata = await ebookService.extractMetadataOnly(req.file);
      res.json({ success: true, metadata });
    } catch (error) {
      next(error);
    }
  }

  async deleteEBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ebookService.deleteEBook(req.params.id as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const ebookController = new EBookController();
