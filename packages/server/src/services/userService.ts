import { db } from "../database/database";
import { ServiceError } from "../types/error";
import { logger } from "../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@tinycore/shared";
import { LoginRequest, RegisterRequest } from "../types/api";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

type UserRow = User & { metadata: string | null };

export class UserService {
  static async get(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get<UserRow>(
        "SELECT id, email, created_at, updated_at, metadata FROM users WHERE id = ?",
        [id],
        (err, row) => {
          if (err) {
            logger.error("Error getting user:", err);
            reject(err);
          } else {
            if (!row) {
              resolve(null);
              return;
            }
            const user: User = {
              ...row,
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            };
            resolve(user);
          }
        }
      );
    });
  }

  static async getByEmail(
    email: string
  ): Promise<(User & { password_hash: string }) | null> {
    return new Promise((resolve, reject) => {
      db.get<UserRow & { password_hash: string }>(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, row) => {
          if (err) {
            logger.error("Error getting user by email:", err);
            reject(err);
          } else {
            if (!row) {
              resolve(null);
              return;
            }
            const user = {
              ...row,
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            };
            resolve(user);
          }
        }
      );
    });
  }

  static async create(userData: RegisterRequest['body']): Promise<User> {
    const { email, password, metadata } = userData;

    // Hash the password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate a unique ID
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, email, password_hash, metadata)
         VALUES (?, ?, ?, ?)`,
        [id, email, password_hash, metadata ? JSON.stringify(metadata) : null],
        function (err: NodeJS.ErrnoException) {
          if (err && err.code === "SQLITE_CONSTRAINT") {
            const error: ServiceError = {
              type: "db_constraint_violation",
              userMessage: "Email already exists",
              statusCode: 409,
            };
            reject(error);
          } else if (err) {
            logger.error("Error creating user:", err);
            reject(err);
          } else {
            // Return the created user (without password)
            UserService.get(id)
              .then((user) => resolve(user!))
              .catch(reject);
          }
        }
      );
    });
  }

  static async login(
    loginData: LoginRequest['body']
  ): Promise<{ user: User; token: string }> {
    const { email, password } = loginData;

    // Get user with password hash
    const userWithPassword = await UserService.getByEmail(email);
    if (!userWithPassword) {
      const error: ServiceError = {
        type: "authentication_failed",
        userMessage: "Invalid email or password",
        statusCode: 401,
      };
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      userWithPassword.password_hash
    );
    if (!isValidPassword) {
      const error: ServiceError = {
        type: "authentication_failed",
        userMessage: "Invalid email or password",
        statusCode: 401,
      };
      throw error;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: userWithPassword.id,
        email: userWithPassword.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user without password hash
    const { password_hash, ...user } = userWithPassword;

    logger.info(`User ${email} logged in successfully`);
    return { user, token };
  }

  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };
      const user = await UserService.get(decoded.userId);

      if (!user) {
        const error: ServiceError = {
          type: "authentication_failed",
          userMessage: "Invalid token",
          statusCode: 401,
        };
        throw error;
      }

      return user;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        const error: ServiceError = {
          type: "authentication_failed",
          userMessage: "Invalid token",
          statusCode: 401,
        };
        throw error;
      }
      throw err;
    }
  }

  static async hasUsers(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM users",
        [],
        (err, row) => {
          if (err) {
            logger.error("Error checking if users exist:", err);
            reject(err);
          } else {
            resolve(row!.count > 0);
          }
        }
      );
    });
  }

  static async list(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      db.all<UserRow>(
        "SELECT id, email, created_at, updated_at, metadata FROM users",
        [],
        (err, rows) => {
          if (err) {
            logger.error("Error listing users:", err);
            reject(err);
          } else {
            const users = rows.map((row) => ({
              ...row,
              metadata: row.metadata ? JSON.parse(row.metadata) : {},
            }));
            resolve(users as User[]);
          }
        }
      );
    });
  }

  static async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
          logger.error("Error deleting user:", err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}
