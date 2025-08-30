import { db } from "../database/database";
import { ServiceError } from "../types/error";
import { Application } from "../types/shared-types";
import { logger } from "../utils/logger";

type ApplicationRow = Application & { metadata: string | null };
type ApplicationUpdate = Omit<Application, 'created_at' | 'updated_at'>

export class ApplicationService {
  static async get(id: string): Promise<Application | null> {
    return new Promise((resolve, reject) => {
      db.get<ApplicationRow>(
        "SELECT * FROM applications WHERE id = ?",
        [id],
        (err, row) => {
          if (err) {
            logger.error("Error getting application:", err);
            reject(err);
          } else {
            if (!row) {
              resolve(null);
              return;
            }
            // Parse JSON fields
            const app: Application = {
              ...row,
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            };
            resolve(app);
          }
        }
      );
    });
  }

  static async create(app: ApplicationUpdate): Promise<void> {
    const { id, name, metadata } = app;
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO applications (id, name, metadata)
         VALUES (?, ?, ?)`,
        [id, name, metadata ? JSON.stringify(metadata) : null],
        (err: NodeJS.ErrnoException) => {
          if (err && err.code === "SQLITE_CONSTRAINT") {
            const error: ServiceError = {
              type: "db_constraint_violation",
              userMessage: "Application ID already exists",
              statusCode: 409,
            };
            reject(error);
          } else if (err) {
            logger.error("Error creating application:", err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async update(app: ApplicationUpdate): Promise<boolean> {
    const { id, name, metadata } = app;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE applications 
         SET name = ?, metadata = ?
         WHERE id = ?`,
        [name, metadata ? JSON.stringify(metadata) : null, id],
        function (err) {
          if (err) {
            logger.error("Error updating application:", err);
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  static async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM applications WHERE id = ?", [id], function (err) {
        if (err) {
          logger.error("Error deleting application:", err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async list(): Promise<Application[]> {
    return new Promise((resolve, reject) => {
      db.all<ApplicationRow>("SELECT * FROM applications", [], (err, rows) => {
        if (err) {
          logger.error("Error listing applications:", err);
          reject(err);
        } else {
          // Parse JSON fields for all rows
          const apps = rows.map((row) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
          }));
          resolve(apps as Application[]);
        }
      });
    });
  }
}
