import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ServiceError } from "../types/error";
import { env } from "process";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Returning error:", err);
  //   const isError = err instanceof Error;
  //   if (isServiceError(err)) {
  //     const errorMessage =
  //       err.userMessage && env.NODE_ENV !== "production"
  //         ? err.userMessage
  //         : "Internal server error";
  //     res.status(500).json({ error: errorMessage });
  //   }
  //   const errorMessage =
  //     isError && env.NODE_ENV !== "production"
  //       ? err.message
  //       : "Internal server error";
  //   res.status(500).json({ error: errorMessage });
  res.status(500).json({ error: "Internal Server Error" });
};

const isServiceError = (err: any): err is ServiceError => {
  return "type" in err;
};
