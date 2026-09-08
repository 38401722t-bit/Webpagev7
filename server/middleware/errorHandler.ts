import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function createError(message: string, statusCode = 400, code = "BAD_REQUEST", details?: any): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || (err.status && typeof err.status === "number" ? err.status : 500);
  const code = err.code || (statusCode === 404 ? "NOT_FOUND" : statusCode === 401 ? "UNAUTHORIZED" : statusCode === 403 ? "FORBIDDEN" : "INTERNAL_SERVER_ERROR");
  const message = err.message || "An unexpected error occurred. Please try again later.";

  if (statusCode >= 500) {
    console.error(`[ERROR 500] ${req.method} ${req.originalUrl}:`, err);
  }

  // Consistent response format requested in Phase 6:
  // { success: false, error: { code: "...", message: "..." } }
  // Also provide detail for backwards compatibility
  res.status(statusCode).json({
    success: false,
    detail: message,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
