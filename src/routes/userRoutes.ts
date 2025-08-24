import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { UserService } from "../services/userService";
import { requireAuth } from "../middleware/auth";
import { logger } from "../utils/logger";
import handleError from "../utils/handleError";

export const userRouter = Router();

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

// Check if registration is allowed (no users exist)
userRouter.get("/registration-status", async (req: Request, res: Response) => {
  try {
    const hasUsers = await UserService.hasUsers();
    res.json({
      registrationAllowed: !hasUsers,
      hasUsers,
    });
  } catch (error) {
    logger.error("Error checking registration status:", error);
    handleError(error, res);
  }
});

// Register new user (only if no users exist)
userRouter.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password, metadata } = req.body;

      // Check if registration is allowed
      const hasUsers = await UserService.hasUsers();
      if (hasUsers) {
        return res.status(403).json({
          error: "Registration is not allowed. System already has users.",
        });
      }

      const user = await UserService.create({ email, password, metadata });

      logger.info(`First user created: ${email}`);
      res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error) {
      logger.error("Error in POST /register:", error);
      handleError(error, res);
    }
  }
);

// Login
userRouter.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await UserService.login({ email, password });

      res.json({
        message: "Login successful",
        user,
        token,
      });
    } catch (error) {
      logger.error("Error in POST /login:", error);
      handleError(error, res);
    }
  }
);

// Get current user profile
userRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    // req.user is set by requireAuth middleware
    res.json(req.user);
  } catch (error) {
    logger.error("Error in GET /me:", error);
    handleError(error, res);
  }
});

// List all users (protected)
userRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const users = await UserService.list();
    res.json(users);
  } catch (error) {
    logger.error("Error in GET /users:", error);
    handleError(error, res);
  }
});

// Delete user (protected)
userRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent users from deleting themselves
    if (req.user!.id === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const deleted = await UserService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`User ${id} deleted by ${req.user!.email}`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error in DELETE /users/:id:", error);
    handleError(error, res);
  }
});
