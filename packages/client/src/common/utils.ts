// Shared utilities across TinyCore services
export function generateId(prefix: string = "tc"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(str: string): string {
  return str.trim().toLowerCase();
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toISOString();
}

export class TinyCoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "TinyCoreError";
  }
}

// Validation helpers
export const validators = {
  isValidAppId: (id: string): boolean => /^[a-zA-Z0-9-_]+$/.test(id),
  isValidKey: (key: string): boolean => key.length > 0 && key.length <= 255,
  isNonEmptyString: (str: any): str is string =>
    typeof str === "string" && str.trim().length > 0,
};
