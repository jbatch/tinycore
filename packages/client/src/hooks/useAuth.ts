import { useState, useEffect, useCallback } from "react";
import { AuthApi, RegistrationStatusResponse } from "../api/auth";
import { useTinyCoreContext } from "./useTinyCore";
import { type User } from "../common/types";

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const { client } = useTinyCoreContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = new AuthApi(client);

  const checkAuthStatus = useCallback(async () => {
    const savedToken = localStorage.getItem("tinycore_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    client.setToken(savedToken);

    try {
      const userData = await auth.getProfile();
      setUser(userData);
    } catch (err) {
      // Token is invalid, remove it
      localStorage.removeItem("tinycore_token");
      client.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await auth.login(email, password);
      localStorage.setItem("tinycore_token", response.token);
      setUser(response.user);
      console.log("Response", {response})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, metadata?: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await auth.register(email, password, metadata);
        localStorage.setItem("tinycore_token", response.token);
        setUser(response.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("tinycore_token");
    auth.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuthStatus,
  };
}

interface UseRegistrationStatusResult {
  registrationAllowed: boolean;
  hasUsers: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegistrationStatus(): UseRegistrationStatusResult {
  const { client } = useTinyCoreContext();
  const [data, setData] = useState<RegistrationStatusResponse>({
    registrationAllowed: false,
    hasUsers: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = new AuthApi(client);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const status = await auth.getRegistrationStatus();
      setData(status);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to check registration status"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    registrationAllowed: data.registrationAllowed,
    hasUsers: data.hasUsers,
    loading,
    error,
    refetch: fetchStatus,
  };
}
