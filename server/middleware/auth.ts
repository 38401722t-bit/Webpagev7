import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/env";
import { DataRepository } from "../repositories/dataRepository";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, CONFIG.JWT_SECRET, { expiresIn: "30d" });
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      detail: "Not authenticated",
      error: { code: "UNAUTHORIZED", message: "Authentication token required" },
    });
  }

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as { sub: string };
    const user = await DataRepository.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        detail: "User not found",
        error: { code: "USER_NOT_FOUND", message: "User not found for provided token" },
      });
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      detail: "Invalid or expired token",
      error: { code: "INVALID_TOKEN", message: "Session token is invalid or expired" },
    });
  }
}

export async function optionalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try {
      const payload = jwt.verify(token, CONFIG.JWT_SECRET) as { sub: string };
      const user = await DataRepository.findUserById(payload.sub);
      if (user) req.user = user;
    } catch {
      // Ignore invalid token for optional endpoints
    }
  }
  next();
}
