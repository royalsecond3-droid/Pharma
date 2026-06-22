import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useApiData<T>(
  fetcher: (residentId: string) => Promise<T>,
  deps: unknown[] = [],
) {
  const { residentId, isAuthenticated } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!residentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(residentId);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [residentId, fetcher]);

  useEffect(() => {
    if (!isAuthenticated || !residentId) {
      setLoading(false);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, residentId, reload, ...deps]);

  return { data, loading, error, reload };
}
