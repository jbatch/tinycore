import { db } from "../database/database";
import { ServiceError } from "../types/error";
import { KVItem, KVItemRow } from "../types/kv";
import { logger } from "../utils/logger";

export class KVService {
  static async get(
    appId: string,
    key: string,
    userId: string
  ): Promise<KVItem | null> {
    return new Promise((resolve, reject) => {
      db.get<KVItemRow>(
        "SELECT * FROM kv_store WHERE app_id = ? AND key = ? AND owner_id = ?",
        [appId, key, userId],
        (err, row) => {
          if (err) {
            logger.error("Error getting KV:", err);
            reject(err);
          } else {
            if (!row) {
              resolve(null);
              return;
            }
            // Parse JSON fields
            const item: KVItem = {
              ...row,
              value: JSON.parse(row.value),
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            };
            resolve(item);
          }
        }
      );
    });
  }

  static async set(item: KVItem): Promise<void> {
    const { app_id, key, value, owner_id, metadata } = item;

    if (!owner_id) {
      const error: ServiceError = {
        type: "validation_error",
        userMessage: "owner_id is required",
        statusCode: 400,
      };
      throw error;
    }

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO kv_store (app_id, key, value, owner_id, metadata)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(app_id, key, owner_id) DO UPDATE SET
         value = excluded.value,
         metadata = excluded.metadata,
         updated_at = CURRENT_TIMESTAMP`,
        [
          app_id,
          key,
          JSON.stringify(value),
          owner_id,
          metadata ? JSON.stringify(metadata) : null,
        ],
        function (err: NodeJS.ErrnoException) {
          if (err && err.code === "SQLITE_CONSTRAINT") {
            const error: ServiceError = {
              type: "db_constraint_violation",
              userMessage: "Invalid owner_id or app_id",
              statusCode: 400,
            };
            reject(error);
          } else if (err) {
            logger.error("Error setting KV:", err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async delete(
    appId: string,
    key: string,
    userId: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM kv_store WHERE app_id = ? AND key = ? AND owner_id = ?",
        [appId, key, userId],
        function (err) {
          if (err) {
            logger.error("Error deleting KV:", err);
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  static async list(
    appId: string,
    prefix?: string,
    userId?: string
  ): Promise<KVItem[]> {
    let query = "SELECT * FROM kv_store WHERE app_id = ?";
    const params: any[] = [appId];

    if (userId) {
      query += " AND owner_id = ?";
      params.push(userId);
    }

    if (prefix) {
      query += " AND key LIKE ?";
      params.push(`${prefix}%`);
    }

    query += " ORDER BY key";

    return new Promise((resolve, reject) => {
      db.all<KVItemRow>(query, params, (err, rows) => {
        if (err) {
          logger.error("Error listing KVs:", err);
          reject(err);
        } else {
          // Parse JSON fields for all rows
          const items = rows.map((row) => ({
            ...row,
            value: JSON.parse(row.value),
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
          }));
          resolve(items as KVItem[]);
        }
      });
    });
  }

  // Admin method to list all items across all users for a given app
  static async listAllUsers(appId: string, prefix?: string): Promise<KVItem[]> {
    return this.list(appId, prefix); // Call without userId to get all users' data
  }

  // Get all keys for a specific user across all apps (useful for user data export)
  static async listByUser(userId: string): Promise<KVItem[]> {
    return new Promise((resolve, reject) => {
      db.all<KVItemRow>(
        "SELECT * FROM kv_store WHERE owner_id = ? ORDER BY app_id, key",
        [userId],
        (err, rows) => {
          if (err) {
            logger.error("Error listing user KVs:", err);
            reject(err);
          } else {
            const items = rows.map((row) => ({
              ...row,
              value: JSON.parse(row.value),
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            }));
            resolve(items as KVItem[]);
          }
        }
      );
    });
  }

  // Check if a key exists for a user
  static async exists(
    appId: string,
    key: string,
    userId: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM kv_store WHERE app_id = ? AND key = ? AND owner_id = ?",
        [appId, key, userId],
        (err, row) => {
          if (err) {
            logger.error("Error checking KV existence:", err);
            reject(err);
          } else {
            resolve(row!.count > 0);
          }
        }
      );
    });
  }

  // Get stats for an app (total keys, total users)
  static async getAppStats(
    appId: string
  ): Promise<{ totalKeys: number; totalUsers: number }> {
    return new Promise((resolve, reject) => {
      db.get<{ totalKeys: number; totalUsers: number }>(
        `SELECT 
           COUNT(*) as totalKeys,
           COUNT(DISTINCT owner_id) as totalUsers 
         FROM kv_store 
         WHERE app_id = ?`,
        [appId],
        (err, row) => {
          if (err) {
            logger.error("Error getting app stats:", err);
            reject(err);
          } else {
            resolve(row || { totalKeys: 0, totalUsers: 0 });
          }
        }
      );
    });
  }
}
