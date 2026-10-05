import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  code: string;
  errors?: any[];

  constructor(message: string, statusCode: number = 400, code: string = "BAD_REQUEST", errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error("API Error:", err);

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      code: "DUPLICATE_KEY",
      message: `A record with this ${field} ('${err.keyValue?.[field]}') already exists`,
      field,
    });
    return;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      code: "INVALID_ID",
      message: `Invalid ID format for parameter '${err.path}'`,
    });
    return;
  }

  // Multer Errors
  if (err.name === "MulterError") {
    res.status(400).json({
      success: false,
      code: "UPLOAD_ERROR",
      message: err.message,
    });
    return;
  }

  // Fallback 500
  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred on the server",
  });
}
