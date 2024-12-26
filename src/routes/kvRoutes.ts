import { Router, Response, Request } from "express";
import { body, param, query, validationResult } from "express-validator";
import { KVService } from "../services/kvService";
import { logger } from "../utils/logger";
import {
  GetKVRequest,
  SetKVRequest,
  DeleteKVRequest,
  ListKVRequest,
  GetKVResponse,
  SetKVResponse,
  DeleteKVResponse,
  ListKVResponse,
} from "../types/api";
import { env } from "process";
import handleError from "../utils/handleError";

export const kvRouter = Router();

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

// Get a value
kvRouter.get(
  "/:appId/:key",
  [param("appId").isString().trim(), param("key").isString().trim()],
  validateRequest,
  async (req: GetKVRequest, res: Response<GetKVResponse>) => {
    try {
      const { appId, key } = req.params;
      const item = await KVService.get(appId, key);

      if (!item) {
        return res.status(404).json({ error: "Key not found" });
      }

      res.json(item);
    } catch (error) {
      logger.error("Error in GET /:appId/:key:", error);
      handleError(error, res);
    }
  }
);

// Set a value
kvRouter.put(
  "/:appId/:key",
  [
    param("appId").isString().trim(),
    param("key").isString().trim(),
    body("value").exists(),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  async (req: SetKVRequest, res: Response<SetKVResponse>) => {
    try {
      const { appId, key } = req.params;
      const { value, metadata, owner_id } = req.body;

      await KVService.set({
        app_id: appId,
        key,
        value,
        metadata,
        owner_id,
      });

      res.status(200).json({ message: "Value set successfully" });
    } catch (error: unknown) {
      logger.error("Error in PUT /:appId/:key:", error);
      handleError(error, res);
    }
  }
);

// Delete a value
kvRouter.delete(
  "/:appId/:key",
  [param("appId").isString().trim(), param("key").isString().trim()],
  validateRequest,
  async (req: DeleteKVRequest, res: Response<DeleteKVResponse>) => {
    try {
      const { appId, key } = req.params;
      const deleted = await KVService.delete(appId, key);

      if (!deleted) {
        return res.status(404).json({ error: "Key not found" });
      }

      res.status(200).json({ message: "Value deleted successfully" });
    } catch (error) {
      logger.error("Error in DELETE /:appId/:key:", error);
      handleError(error, res);
    }
  }
);

// List keys (with optional prefix)
kvRouter.get(
  "/:appId",
  [param("appId").isString().trim(), query("prefix").optional().isString()],
  validateRequest,
  async (req: ListKVRequest, res: Response<ListKVResponse>) => {
    try {
      const { appId } = req.params;
      const prefix = req.query.prefix;

      const items = await KVService.list(appId, prefix);
      res.json(items);
    } catch (error) {
      logger.error("Error in GET /:appId:", error);
      handleError(error, res);
    }
  }
);
