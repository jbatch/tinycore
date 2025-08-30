// Shared types across all TinyCore services
export interface TinyCoreConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TimestampedEntity {
  created_at: string;
  updated_at: string;
}

// Re-export types that were previously in the main app
export interface User extends TimestampedEntity {
  id: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface Application extends TimestampedEntity {
  id: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface KVItem extends TimestampedEntity {
  app_id: string;
  key: string;
  value: any;
  owner_id?: string;
  metadata?: Record<string, any>;
}
