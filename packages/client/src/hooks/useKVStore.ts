import { useState, useEffect, useCallback } from "react";
import { KVItem, KVApi } from "../api/kv";
import { useTinyCoreContext } from "./useTinyCore";

interface UseKVStoreOptions {
  autoFetch?: boolean;
}

interface UseKVStoreResult {
  data: KVItem | null;
  loading: boolean;
  error: string | null;
  set: (value: any, metadata?: Record<string, any>) => Promise<void>;
  delete: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useKVStore(
  appId: string,
  key: string,
  options: UseKVStoreOptions = {}
): UseKVStoreResult {
  const { autoFetch = true } = options;
  const { client } = useTinyCoreContext();
  const [data, setData] = useState<KVItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kv = new KVApi(client);

  const fetchData = useCallback(async () => {
    if (!appId || !key) return;

    setLoading(true);
    setError(null);

    try {
      const result = await kv.get(appId, key);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [appId, key]);

  const set = useCallback(
    async (value: any, metadata?: Record<string, any>) => {
      setError(null);

      try {
        await kv.set(appId, key, value, metadata);
        // Refetch to get updated data
        await fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to set value");
        throw err;
      }
    },
    [appId, key, fetchData]
  );

  const deleteKey = useCallback(async () => {
    setError(null);

    try {
      await kv.delete(appId, key);
      setData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
      throw err;
    }
  }, [appId, key]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    set,
    delete: deleteKey,
    refetch: fetchData,
  };
}

interface UseKVListResult {
  data: KVItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (
    key: string,
    value: any,
    metadata?: Record<string, any>
  ) => Promise<void>;
  deleteKey: (key: string) => Promise<void>;
}

export function useKVList(appId: string, prefix?: string): UseKVListResult {
  const { client } = useTinyCoreContext();
  const [data, setData] = useState<KVItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kv = new KVApi(client);

  const fetchData = useCallback(async () => {
    if (!appId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await kv.list(appId, prefix);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [appId, prefix]);

  const create = useCallback(
    async (key: string, value: any, metadata?: Record<string, any>) => {
      setError(null);

      try {
        await kv.set(appId, key, value, metadata);
        await fetchData(); // Refetch list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create item");
        throw err;
      }
    },
    [appId, fetchData]
  );

  const deleteKey = useCallback(
    async (key: string) => {
      setError(null);

      try {
        await kv.delete(appId, key);
        await fetchData(); // Refetch list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete item");
        throw err;
      }
    },
    [appId, fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    deleteKey,
  };
}
