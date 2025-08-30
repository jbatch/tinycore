import { useState, useEffect, useCallback } from "react";
import { Application, ApplicationsApi } from "../api/applications";
import { useTinyCoreContext } from "./useTinyCore";

interface UseApplicationsResult {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (application: Omit<Application, "created_at">) => Promise<void>;
  update: (
    id: string,
    updates: Omit<Application, "id" | "created_at">
  ) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export function useApplications(): UseApplicationsResult {
  const { client } = useTinyCoreContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new ApplicationsApi(client);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.list();
      setApplications(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch applications"
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (application: Omit<Application, "created_at">) => {
      setError(null);

      try {
        await api.create(application);
        await fetchApplications(); // Refetch list
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create application"
        );
        throw err;
      }
    },
    [fetchApplications]
  );

  const update = useCallback(
    async (id: string, updates: Omit<Application, "id" | "created_at">) => {
      setError(null);

      try {
        await api.update(id, updates);
        await fetchApplications(); // Refetch list
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update application"
        );
        throw err;
      }
    },
    [fetchApplications]
  );

  const deleteApp = useCallback(
    async (id: string) => {
      setError(null);

      try {
        await api.delete(id);
        await fetchApplications(); // Refetch list
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete application"
        );
        throw err;
      }
    },
    [fetchApplications]
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    create,
    update,
    delete: deleteApp,
  };
}

interface UseApplicationResult {
  application: Application | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApplication(id: string): UseApplicationResult {
  const { client } = useTinyCoreContext();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new ApplicationsApi(client);

  const fetchApplication = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.get(id);
      setApplication(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch application"
      );
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    loading,
    error,
    refetch: fetchApplication,
  };
}
