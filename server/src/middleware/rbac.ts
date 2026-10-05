import { Response, NextFunction } from "express";
import { UserRole } from "../constants/index.js";
import { AuthenticatedRequest } from "../types/index.js";

export function authorizeRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
      return;
    }

    next();
  };
}
