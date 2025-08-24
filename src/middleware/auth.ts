import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { logger } from "../utils/logger";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        created_at: string;
        updated_at: string;
        metadata?: Record<string, any>;
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const user = await UserService.verifyToken(token);

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = await UserService.verifyToken(token);
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't reject on auth failure
    // Just continue without setting req.user
    next();
  }
};
