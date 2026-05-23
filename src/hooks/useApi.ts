import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useApiData<T>(
  fetcher: (fin: string) => Promise<T>,
  deps: unknown[] = [],
) {
  const { faydaFin, isAuthenticated } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!faydaFin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(faydaFin);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [faydaFin, fetcher]);

  useEffect(() => {
    if (!isAuthenticated || !faydaFin) {
      setLoading(false);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, faydaFin, reload, ...deps]);

  return { data, loading, error, reload };
}
