import express from "express";
import helmet from "helmet";
import cors from "cors";
import { initializeDatabase } from "./database/database";
import { errorHandler } from "./middleware/error";
import { kvRouter } from "./routes/kvRoutes";
import { appRouter } from "./routes/appRoutes";
// import { userRouter } from "./routes/userRoutes";
import { logger } from "./utils/logger";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/kv", kvRouter);
app.use("/api/v1/apps", appRouter);
// app.use("/api/v1/users", userRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "kv-admin")));

  // Handle client routing by sending all non-API routes to index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "kv-admin/index.html"));
  });
}

// Error handling
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      logger.info(`TinyCore-KV server running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  });
