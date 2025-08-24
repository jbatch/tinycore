export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface Application {
  id: string;
  name: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface KVItem {
  key: string;
  value: unknown;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  owner_id?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegistrationStatusResponse {
  registrationAllowed: boolean;
  hasUsers: boolean;
}
