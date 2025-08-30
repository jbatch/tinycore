import { TinyCoreApiClient } from "./core";

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegistrationStatusResponse {
  registrationAllowed: boolean;
  hasUsers: boolean;
}

export class AuthApi {
  constructor(private client: TinyCoreApiClient) {}

  async getRegistrationStatus(): Promise<RegistrationStatusResponse> {
    return this.client.get<RegistrationStatusResponse>(
      "/users/registration-status"
    );
  }

  async register(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<LoginResponse> {
    return this.client.post<LoginResponse>("/users/register", {
      email,
      password,
      metadata,
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>("/users/login", {
      email,
      password,
    });

    // Automatically set token for future requests
    this.client.setToken(response.token);

    return response;
  }

  async getProfile(): Promise<User> {
    return this.client.get<User>("/users/me");
  }

  logout() {
    this.client.setToken(null);
  }
}
