import { TinyCoreApiClient } from "./core";

export interface Application {
  id: string;
  name: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export class ApplicationsApi {
  constructor(private client: TinyCoreApiClient) {}

  async get(id: string): Promise<Application> {
    return this.client.get<Application>(`/apps/${id}`);
  }

  async list(): Promise<Application[]> {
    return this.client.get<Application[]>("/apps");
  }

  async create(
    application: Omit<Application, "created_at">
  ): Promise<{ message: string }> {
    return this.client.post<{ message: string }>("/apps", application);
  }

  async update(
    id: string,
    updates: Omit<Application, "id" | "created_at">
  ): Promise<{ message: string }> {
    return this.client.put<{ message: string }>(`/apps/${id}`, updates);
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/apps/${id}`);
  }
}
