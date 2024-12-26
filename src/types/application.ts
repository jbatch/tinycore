export interface Application {
  id: string;
  name: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface ApplicationRow {
  id: string;
  name: string;
  created_at: string;
  metadata: string | null;
}
