import { Request, Response, NextFunction } from "express";
import { departmentService } from "../services/department.service.js";

export class DepartmentController {
  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await departmentService.getDepartments();
      res.json({ success: true, departments });
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.createDepartment(req.body);
      res.status(201).json({ success: true, department });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.updateDepartment(req.params.id as string, req.body);
      res.json({ success: true, department });
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.deleteDepartment(req.params.id as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();
