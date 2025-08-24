// src/database/migrations.ts
import { db } from "./database";
import { logger } from "../utils/logger";
import fs from "fs";
import path from "path";

export interface Migration {
  id: string;
  description: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

class MigrationManager {
  private migrations: Migration[] = [];

  constructor() {
    this.loadMigrations();
  }

  private loadMigrations() {
    // Migration 001: Add composite primary key for user-scoped KV
    this.migrations.push({
      id: "001_user_scoped_kv",
      description:
        "Update KV store to support user-scoped keys with composite primary key",
      up: async () => {
        return new Promise((resolve, reject) => {
          const migrationSQL = `
            -- Create migrations table if it doesn't exist
            CREATE TABLE IF NOT EXISTS migrations (
              id TEXT PRIMARY KEY,
              description TEXT NOT NULL,
              applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Create new KV store table with composite key
            CREATE TABLE IF NOT EXISTS kv_store_new (
              app_id TEXT NOT NULL,
              key TEXT NOT NULL,
              value JSON NOT NULL,
              owner_id TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              metadata JSON,
              PRIMARY KEY (app_id, key, owner_id),
              FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE,
              FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            );

            -- Migrate existing data (assign to first user if any users exist)
            INSERT INTO kv_store_new (app_id, key, value, owner_id, created_at, updated_at, metadata)
            SELECT 
              kv.app_id,
              kv.key,
              kv.value,
              COALESCE(kv.owner_id, (SELECT id FROM users ORDER BY created_at LIMIT 1)) as owner_id,
              kv.created_at,
              kv.updated_at,
              kv.metadata
            FROM kv_store kv
            WHERE EXISTS (SELECT 1 FROM users);

            -- Drop old table and rename new one
            DROP TABLE IF EXISTS kv_store;
            ALTER TABLE kv_store_new RENAME TO kv_store;

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_kv_store_app_owner ON kv_store(app_id, owner_id);
            CREATE INDEX IF NOT EXISTS idx_kv_store_owner ON kv_store(owner_id);
          `;

          db.exec(migrationSQL, (err) => {
            if (err) {
              logger.error("Migration 001 failed:", err);
              reject(err);
            } else {
              logger.info("Migration 001 completed successfully");
              resolve();
            }
          });
        });
      },
      down: async () => {
        return new Promise((resolve, reject) => {
          const rollbackSQL = `
            -- Create old table structure
            CREATE TABLE IF NOT EXISTS kv_store_old (
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

            -- Migrate data back (may lose data if there are conflicts)
            INSERT OR IGNORE INTO kv_store_old 
            SELECT app_id, key, value, owner_id, created_at, updated_at, metadata 
            FROM kv_store;

            -- Replace table
            DROP TABLE kv_store;
            ALTER TABLE kv_store_old RENAME TO kv_store;
          `;

          db.exec(rollbackSQL, (err) => {
            if (err) {
              logger.error("Migration 001 rollback failed:", err);
              reject(err);
            } else {
              logger.info("Migration 001 rolled back successfully");
              resolve();
            }
          });
        });
      },
    });

    // Add more migrations here as needed
    // this.migrations.push({
    //   id: "002_add_user_roles",
    //   description: "Add roles column to users table",
    //   up: async () => { /* implementation */ },
    //   down: async () => { /* rollback */ }
    // });
  }

  private async initializeMigrationsTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      db.run(sql, (err) => {
        if (err) {
          logger.error("Failed to initialize migrations table:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async getAppliedMigrations(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      db.all<{ id: string }>("SELECT id FROM migrations", [], (err, rows) => {
        if (err) {
          logger.error("Failed to get applied migrations:", err);
          reject(err);
        } else {
          resolve(rows.map((row) => row.id));
        }
      });
    });
  }

  private async markMigrationAsApplied(migration: Migration): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO migrations (id, description) VALUES (?, ?)",
        [migration.id, migration.description],
        (err) => {
          if (err) {
            logger.error(
              `Failed to mark migration ${migration.id} as applied:`,
              err
            );
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private async removeMigrationRecord(migrationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM migrations WHERE id = ?", [migrationId], (err) => {
        if (err) {
          logger.error(
            `Failed to remove migration record ${migrationId}:`,
            err
          );
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async runMigrations(): Promise<void> {
    try {
      await this.initializeMigrationsTable();
      const appliedMigrations = await this.getAppliedMigrations();

      const pendingMigrations = this.migrations.filter(
        (migration) => !appliedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        logger.info("No pending migrations to run");
        return;
      }

      logger.info(`Running ${pendingMigrations.length} pending migrations...`);

      for (const migration of pendingMigrations) {
        logger.info(
          `Running migration: ${migration.id} - ${migration.description}`
        );

        try {
          await migration.up();
          await this.markMigrationAsApplied(migration);
          logger.info(`✅ Migration ${migration.id} completed successfully`);
        } catch (error) {
          logger.error(`❌ Migration ${migration.id} failed:`, error);
          throw new Error(`Migration ${migration.id} failed: ${error}`);
        }
      }

      logger.info("All migrations completed successfully!");
    } catch (error) {
      logger.error("Migration process failed:", error);
      throw error;
    }
  }

  async rollbackMigration(migrationId: string): Promise<void> {
    const migration = this.migrations.find((m) => m.id === migrationId);

    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    if (!migration.down) {
      throw new Error(
        `Migration ${migrationId} does not have a rollback function`
      );
    }

    logger.info(`Rolling back migration: ${migrationId}`);

    try {
      await migration.down();
      await this.removeMigrationRecord(migrationId);
      logger.info(`✅ Migration ${migrationId} rolled back successfully`);
    } catch (error) {
      logger.error(`❌ Rollback of migration ${migrationId} failed:`, error);
      throw error;
    }
  }

  async getStatus(): Promise<{ applied: string[]; pending: string[] }> {
    await this.initializeMigrationsTable();
    const appliedMigrations = await this.getAppliedMigrations();

    const allMigrationIds = this.migrations.map((m) => m.id);
    const pendingMigrations = allMigrationIds.filter(
      (id) => !appliedMigrations.includes(id)
    );

    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
    };
  }

  getMigrations(): Migration[] {
    return this.migrations;
  }
}

export const migrationManager = new MigrationManager();
