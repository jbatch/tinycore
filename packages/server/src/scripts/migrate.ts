#!/usr/bin/env ts-node
// src/scripts/migrate.ts

import { migrationManager } from "../database/migrations";
import { logger } from "../utils/logger";

const command = process.argv[2];
const migrationId = process.argv[3];

async function main() {
  try {
    switch (command) {
      case "status":
        const status = await migrationManager.getStatus();
        console.log("\n📊 Migration Status:");
        console.log(`✅ Applied: ${status.applied.length}`);
        status.applied.forEach((id) => console.log(`   - ${id}`));
        console.log(`⏳ Pending: ${status.pending.length}`);
        status.pending.forEach((id) => console.log(`   - ${id}`));
        console.log();
        break;

      case "up":
        console.log("🚀 Running pending migrations...");
        await migrationManager.runMigrations();
        console.log("✅ All migrations completed!");
        break;

      case "down":
        if (!migrationId) {
          console.error("❌ Migration ID required for rollback");
          console.log("Usage: npm run migrate down <migration_id>");
          process.exit(1);
        }
        console.log(`🔄 Rolling back migration: ${migrationId}`);
        await migrationManager.rollbackMigration(migrationId);
        console.log("✅ Rollback completed!");
        break;

      case "list":
        const migrations = migrationManager.getMigrations();
        console.log("\n📋 Available Migrations:");
        migrations.forEach((migration) => {
          console.log(`   ${migration.id}: ${migration.description}`);
        });
        console.log();
        break;

      default:
        console.log(`
🛠️  TinyCore-KV Migration Tool

Usage:
  npm run migrate <command> [args]

Commands:
  status     Show applied and pending migrations
  up         Run all pending migrations
  down <id>  Rollback a specific migration
  list       List all available migrations

Examples:
  npm run migrate status
  npm run migrate up
  npm run migrate down 001_user_scoped_kv
  npm run migrate list
        `);
        break;
    }
  } catch (error) {
    logger.error("Migration command failed:", error);
    process.exit(1);
  }
}

main();
