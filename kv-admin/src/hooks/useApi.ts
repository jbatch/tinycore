import { Application, KVItem } from "@/types/frontend";
import { useCallback, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseApplicationsReturn extends ApiResponse<Application[]> {
  fetchApplications: () => Promise<void>;
  createApplication: (app: {
    id: string;
    name: string;
    metadata?: Record<string, unknown>;
  }) => Promise<boolean>;
  updateApplication: (
    id: string,
    app: { name: string; metadata?: Record<string, unknown> }
  ) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
  getApplication: (id: string) => Promise<Application | null>;
}

interface UseKVStoreReturn extends ApiResponse<KVItem[]> {
  fetchKVItems: (appId: string, prefix?: string) => Promise<void>;
  createKVItem: (
    appId: string,
    key: string,
    value: unknown,
    metadata?: Record<string, unknown>
  ) => Promise<boolean>;
  updateKVItem: (
    appId: string,
    key: string,
    value: unknown,
    metadata?: Record<string, unknown>
  ) => Promise<boolean>;
  deleteKVItem: (appId: string, key: string) => Promise<boolean>;
  getKVItem: (appId: string, key: string) => Promise<KVItem | null>;
}

// Helper function to create authenticated fetch headers
const getAuthHeaders = (token: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const useApplications = (
  token: string | null
): UseApplicationsReturn => {
  const [data, setData] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleApiError = (error: unknown) => {
    if (error instanceof Response) {
      return `API Error: ${error.status} ${error.statusText}`;
    }
    return error instanceof Error ? error.message : "An unknown error occurred";
  };

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apps`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw response;
      const apps = await response.json();
      setData(apps);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createApplication = async (app: {
    id: string;
    name: string;
    metadata?: Record<string, unknown>;
  }) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apps`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(app),
      });
      if (!response.ok) throw response;
      await fetchApplications();
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const updateApplication = async (
    id: string,
    app: { name: string; metadata?: Record<string, unknown> }
  ) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(app),
      });
      if (!response.ok) throw response;
      await fetchApplications();
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const deleteApplication = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw response;
      await fetchApplications();
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const getApplication = async (id: string): Promise<Application | null> => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${id}`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  };

  return {
    data,
    error,
    isLoading,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  };
};

export const useKVStore = (token: string | null): UseKVStoreReturn => {
  const [data, setData] = useState<KVItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleApiError = (error: unknown) => {
    if (error instanceof Response) {
      return `API Error: ${error.status} ${error.statusText}`;
    }
    return error instanceof Error ? error.message : "An unknown error occurred";
  };

  const fetchKVItems = useCallback(
    async (appId: string, prefix?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL(`${API_BASE_URL}/kv/${appId}`);
        if (prefix) url.searchParams.set("prefix", prefix);
        const response = await fetch(url.toString(), {
          headers: getAuthHeaders(token),
        });
        if (!response.ok) throw response;
        const items = await response.json();
        setData(items);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const createKVItem = async (
    appId: string,
    key: string,
    value: unknown,
    metadata?: Record<string, unknown>
  ) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/kv/${appId}/${key}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ value, metadata }),
      });
      if (!response.ok) throw response;
      await fetchKVItems(appId);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const updateKVItem = async (
    appId: string,
    key: string,
    value: unknown,
    metadata?: Record<string, unknown>
  ) => {
    return createKVItem(appId, key, value, metadata); // PUT endpoint handles both create and update
  };

  const deleteKVItem = async (appId: string, key: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/kv/${appId}/${key}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw response;
      await fetchKVItems(appId);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  };

  const getKVItem = async (
    appId: string,
    key: string
  ): Promise<KVItem | null> => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/kv/${appId}/${key}`, {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (err) {
      setError(handleApiError(err));
      return null;
    }
  };

  return {
    data,
    error,
    isLoading,
    fetchKVItems,
    createKVItem,
    updateKVItem,
    deleteKVItem,
    getKVItem,
  };
};
