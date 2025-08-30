import sqlite3 from "sqlite3";
import { logger } from "../utils/logger";
import { migrationManager } from "./migrations";

const DB_PATH = process.env.DB_PATH || "./data/tinycore.db";

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error(`Error opening database: ${err.message}`, err);
  } else {
    logger.info("Successfully opened database connection");
  }
});

export async function initializeDatabase(): Promise<void> {
  // First, create the base schema (tables that migrations depend on)
  const baseSchema = `
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON
    );

    -- Create initial kv_store table (will be migrated by migration 001)
    CREATE TABLE IF NOT EXISTS kv_store (
      app_id TEXT,
      key TEXT,
      value JSON,
      owner_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON,
      PRIMARY KEY (app_id, key),
      FOREIGN KEY (app_id) REFERENCES applications(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );
  `;

  return new Promise(async (resolve, reject) => {
    // Create base schema first
    db.exec(baseSchema, async (err) => {
      if (err) {
        logger.error("Base database schema creation failed:", err);
        reject(err);
        return;
      }

      logger.info("Base database schema created successfully");

      try {
        // Run any pending migrations
        await migrationManager.runMigrations();
        logger.info("Database initialization completed successfully");
        resolve();
      } catch (migrationError) {
        logger.error("Database migration failed:", migrationError);
        reject(migrationError);
      }
    });
  });
}

// Export migration manager for CLI usage
export { migrationManager };
