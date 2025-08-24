export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface UserRow {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata: string | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

export interface LoginData {
  email: string;
  password: string;
}
