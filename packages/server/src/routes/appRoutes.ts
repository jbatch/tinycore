import { Router, Response, Request } from "express";
import { body, param, validationResult } from "express-validator";
import { ApplicationService } from "../services/applicationService";
import { logger } from "../utils/logger";
import handleError from "../utils/handleError";
import {
  GetApplicationRequest,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  DeleteApplicationRequest,
  GetApplicationResponse,
  CreateApplicationResponse,
  UpdateApplicationResponse,
  DeleteApplicationResponse,
  ListApplicationResponse,
} from "../types/api";

export const appRouter = Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors.array() });
  }
  next();
};

// Get an application
appRouter.get(
  "/:id",
  [param("id").isString().trim()],
  validateRequest,
  async (req: GetApplicationRequest, res: Response<GetApplicationResponse>) => {
    try {
      const { id } = req.params;
      const app = await ApplicationService.get(id);

      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }

      logger.info(`Fetched application: ${id}`);
      res.json(app);
    } catch (error) {
      logger.error("Error in GET /:id:", error);
      handleError(error, res);
    }
  }
);

// Create an application
appRouter.post(
  "/",
  [
    body("id").isString().trim(),
    body("name").isString().trim(),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  async (
    req: CreateApplicationRequest,
    res: Response<CreateApplicationResponse>
  ) => {
    try {
      const { id, name, metadata } = req.body;

      await ApplicationService.create({
        id,
        name,
        metadata,
      });

      logger.info(`Created application ${id}`);
      res.status(201).json({ message: "Application created successfully" });
    } catch (error) {
      logger.error("Error in POST /:", error);
      handleError(error, res);
    }
  }
);

// Update an application
appRouter.put(
  "/:id",
  [
    param("id").isString().trim(),
    body("name").isString().trim(),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  async (
    req: UpdateApplicationRequest,
    res: Response<UpdateApplicationResponse>
  ) => {
    try {
      const { id } = req.params;
      const { name, metadata } = req.body;

      const updated = await ApplicationService.update({
        id,
        name,
        metadata,
      });

      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }

      logger.info(`Updated application ${id}`);
      res.json({ message: "Application updated successfully" });
    } catch (error) {
      logger.error("Error in PUT /:id:", error);
      handleError(error, res);
    }
  }
);

// Delete an application
appRouter.delete(
  "/:id",
  [param("id").isString().trim()],
  validateRequest,
  async (
    req: DeleteApplicationRequest,
    res: Response<DeleteApplicationResponse>
  ) => {
    try {
      const { id } = req.params;
      const deleted = await ApplicationService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }

      logger.info(`Deleted application ${id}`);
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      logger.error("Error in DELETE /:id:", error);
      handleError(error, res);
    }
  }
);

// List all applications
appRouter.get(
  "/",
  async (_req: Request, res: Response<ListApplicationResponse>) => {
    try {
      const apps = await ApplicationService.list();
      logger.info(`Fetched applications`);
      res.json(apps);
    } catch (error) {
      logger.error("Error in GET /:", error);
      handleError(error, res);
    }
  }
);
