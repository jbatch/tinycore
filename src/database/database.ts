import sqlite3 from "sqlite3";
import { logger } from "../utils/logger";

const DB_PATH = process.env.DB_PATH || "./data/tinycore.db";

export const db = new sqlite3.Database(DB_PATH);

export async function initializeDatabase(): Promise<void> {
  const schema = `
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

  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        logger.error("Database initialization failed:", err);
        reject(err);
      } else {
        logger.info("Database initialized successfully");
        resolve();
      }
    });
  });
}
