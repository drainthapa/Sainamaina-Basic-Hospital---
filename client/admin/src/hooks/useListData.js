import { useCallback, useEffect, useState } from 'react';

/**
 * Manages list state (rows, total, loading, error) for a paginated CRUD listing page.
 * @param {(params: object) => Promise<any>} fetchFn - API call, e.g. departmentsApi.list
 * @param {object} initialParams - e.g. { limit: 20, offset: 0 }
 */
export function useListData(fetchFn, initialParams = {}) {
  const [params, setParams] = useState(initialParams);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchFn(params)
      .then((response) => {
        if (cancelled) return;
        setRows(response.data.data);
        setTotal(response.data.meta?.total ?? response.data.data.length);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), reloadToken]);

  return { rows, total, isLoading, error, params, setParams, reload };
}
