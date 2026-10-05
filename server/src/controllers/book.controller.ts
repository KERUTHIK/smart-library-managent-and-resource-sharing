import { Request, Response, NextFunction } from "express";
import { bookService } from "../services/book.service.js";
import { duplicateService } from "../services/duplicate.service.js";
import { AuthenticatedRequest } from "../types/index.js";

export class BookController {
  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, department, availability, page, limit } = req.query;
      const result = await bookService.getBooks({
        search: search as string,
        category: category as string,
        department: department as string,
        availability: availability as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await bookService.getBookById(req.params.id as string);
      res.json({ success: true, book });
    } catch (error) {
      next(error);
    }
  }

  async checkDuplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { isbn, title, author, edition, publisher, excludeBookId } = req.body;
      const result = await duplicateService.checkBookDuplicate({
        isbn,
        title,
        author,
        edition,
        publisher,
        excludeBookId,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.createBook(req.body, req.user?.userId);
      res.status(201).json({ success: true, book });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.updateBook(req.params.id as string, req.body);
      res.json({ success: true, book });
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await bookService.deleteBook(req.params.id as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async addCopy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await bookService.addCopy(req.params.id as string, req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPopularBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const books = await bookService.getPopularBooks(limit);
      res.json({ success: true, books });
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
