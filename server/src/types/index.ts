import { Request } from "express";
import { UserRole, UserStatus } from "../constants/index.js";
import { Types } from "mongoose";

export interface AuthUserPayload {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  status: UserStatus;
  name: string;
  collegeId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
