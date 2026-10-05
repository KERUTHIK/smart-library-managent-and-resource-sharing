import { Request, Response, NextFunction } from "express";
import { librarianService } from "../services/librarian.service.js";

export class LibrarianController {
  async getLibrarians(req: Request, res: Response, next: NextFunction) {
    try {
      const { dept } = req.query;
      const librarians = await librarianService.getLibrarians(dept as string);
      res.json({ success: true, librarians });
    } catch (error) {
      next(error);
    }
  }

  async createLibrarian(req: Request, res: Response, next: NextFunction) {
    try {
      const librarian = await librarianService.createLibrarian(req.body);
      res.status(201).json({ success: true, librarian });
    } catch (error) {
      next(error);
    }
  }

  async updateLibrarian(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await librarianService.updateLibrarian(req.params.id as string, req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const result = await librarianService.toggleStatus(req.params.id as string, status, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const librarianController = new LibrarianController();
