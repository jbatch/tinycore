// src/utils/errorUtils.ts
export function getErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle Response objects (fetch errors)
  if (error instanceof Response) {
    return `HTTP ${error.status}: ${error.statusText}`;
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  // Handle objects with error property (some APIs return {error: "message"})
  if (error && typeof error === "object" && "error" in error) {
    return String(error.error);
  }

  // Fallback
  return "An unknown error occurred";
}
