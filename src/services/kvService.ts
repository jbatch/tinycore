import { db } from "../database/database";
import { ServiceError } from "../types/error";
import { KVItem, KVItemRow } from "../types/kv";
import { logger } from "../utils/logger";

export class KVService {
  static async get(appId: string, key: string): Promise<KVItem | null> {
    return new Promise((resolve, reject) => {
      db.get<KVItemRow>(
        "SELECT * FROM kv_store WHERE app_id = ? AND key = ?",
        [appId, key],
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
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO kv_store (app_id, key, value, owner_id, metadata)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(app_id, key) DO UPDATE SET
         value = excluded.value,
         owner_id = excluded.owner_id,
         metadata = excluded.metadata,
         updated_at = CURRENT_TIMESTAMP`,
        [
          app_id,
          key,
          JSON.stringify(value),
          owner_id || null,
          metadata ? JSON.stringify(metadata) : null,
        ],
        (err: NodeJS.ErrnoException) => {
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

  static async delete(appId: string, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM kv_store WHERE app_id = ? AND key = ?",
        [appId, key],
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

  static async list(appId: string, prefix?: string): Promise<KVItem[]> {
    const query = prefix
      ? "SELECT * FROM kv_store WHERE app_id = ? AND key LIKE ?"
      : "SELECT * FROM kv_store WHERE app_id = ?";
    const params = prefix ? [appId, `${prefix}%`] : [appId];

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
}
