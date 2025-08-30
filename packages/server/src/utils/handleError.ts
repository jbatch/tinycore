import { Response } from "express";
import { env } from "process";
import { type ServiceError } from "../types/error";

const handleError = (error: unknown, res: Response) => {
  const isError = error instanceof Error;
  if (isServiceError(error)) {
    const errorMessage =
      error.userMessage && env.NODE_ENV !== "production"
        ? error.userMessage
        : "Internal server error";
    const statusCode = error.statusCode ? error.statusCode : 500;
    res.status(statusCode).json({ error: errorMessage });
    return;
  }
  const errorMessage =
    isError && env.NODE_ENV !== "production"
      ? error.message
      : "Internal server error";
  res.status(500).json({ error: errorMessage });
};

const isServiceError = (err: any): err is ServiceError => {
  return "type" in err;
};
export default handleError;
