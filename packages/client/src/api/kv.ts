import { TinyCoreApiClient } from "./core";

export interface KVItem {
  app_id: string;
  key: string;
  value: any;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export class KVApi {
  constructor(private client: TinyCoreApiClient) {}

  async get(appId: string, key: string): Promise<KVItem> {
    return this.client.get<KVItem>(`/kv/${appId}/${key}`);
  }

  async set(
    appId: string,
    key: string,
    value: any,
    metadata?: Record<string, any>
  ): Promise<{ message: string }> {
    return this.client.put<{ message: string }>(`/kv/${appId}/${key}`, {
      value,
      metadata,
    });
  }

  async delete(appId: string, key: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/kv/${appId}/${key}`);
  }

  async list(appId: string, prefix?: string): Promise<KVItem[]> {
    const endpoint = `/kv/${appId}${
      prefix ? `?prefix=${encodeURIComponent(prefix)}` : ""
    }`;
    return this.client.get<KVItem[]>(endpoint);
  }
}
