export interface KVItem {
  app_id: string;
  key: string;
  value: any;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface KVItemRow {
  app_id: string;
  key: string;
  value: string; // JSON string
  owner_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: string;
}
