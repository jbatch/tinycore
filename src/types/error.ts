export interface ServiceError {
  type: string;
  userMessage?: string;
  statusCode?: number;
}
