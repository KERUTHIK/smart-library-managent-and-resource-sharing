import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { AuthenticatedRequest, AuthUserPayload } from "../types/index.js";
import { User } from "../models/User.js";
import { UserStatus } from "../constants/index.js";

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication token is required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    const user = await User.findById(decoded.id).select("-passwordHash").lean();

    if (!user) {
      res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account associated with this token no longer exists",
      });
      return;
    }

    if (user.status === UserStatus.SUSPENDED) {
      res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: "Your library account has been suspended. Please contact library administration.",
      });
      return;
    }

    if (user.status === UserStatus.INACTIVE) {
      res.status(403).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        message: "Your library account is inactive.",
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ? user.departmentId.toString() : undefined,
      departmentName: user.departmentName,
      status: user.status,
      name: user.name,
      collegeId: user.collegeId,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: err.name === "TokenExpiredError" ? "Authentication token has expired" : "Invalid authentication token",
    });
  }
}
