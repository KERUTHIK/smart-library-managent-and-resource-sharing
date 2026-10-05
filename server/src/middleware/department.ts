import { Response, NextFunction } from "express";
import { UserRole } from "../constants/index.js";
import { AuthenticatedRequest } from "../types/index.js";

/**
 * Ensures that if a Librarian performs an operation tied to a department,
 * they can only perform it on their assigned department.
 * Admins bypass this restriction.
 */
export function authorizeDepartment(getDepartmentIdFromRequest?: (req: AuthenticatedRequest) => string | undefined) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication required" });
      return;
    }

    // Admins have global access across all departments
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (req.user.role === UserRole.LIBRARIAN) {
      if (!req.user.departmentId) {
        res.status(403).json({
          success: false,
          code: "NO_DEPARTMENT_ASSIGNED",
          message: "Librarian has no department assigned",
        });
        return;
      }

      if (getDepartmentIdFromRequest) {
        const targetDeptId = getDepartmentIdFromRequest(req);
        if (targetDeptId && targetDeptId !== req.user.departmentId) {
          res.status(403).json({
            success: false,
            code: "DEPARTMENT_ACCESS_DENIED",
            message: "Librarians can only manage resources within their assigned department",
          });
          return;
        }
      }
    }

    next();
  };
}
