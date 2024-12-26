import sqlite3 from "sqlite3";
import { logger } from "../utils/logger";
import fs from "fs";
import child_process from "child_process";

const DB_PATH = process.env.DB_PATH || "./data/tinycore.db";
// console.log({
//   DB_PATH,
//   files: fs.readdirSync("/app/data"),
//   //   access: fs.accessSync("/app/data", fs.constants.W_OK),
//   user: require("os").userInfo(),
//   ls: fs.readdirSync("/app"),
//   stat: fs.lstatSync("/app/data"),
//   f2: child_process.spawnSync("ls", ["-la", "/app"]).stdout.toString(),
// });

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error(`Error opening database: ${err.message}`, err);
  } else {
    logger.info("Successfully opened database connection");
  }
});

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
