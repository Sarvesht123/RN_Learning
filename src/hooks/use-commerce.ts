import { DependencyList, useCallback, useEffect, useState } from 'react';
/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
export function useCommerce<T>(loader: () => Promise<T>, dependencies: DependencyList) {
  const [data, setData] = useState<T>(); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { try { setLoading(true); setError(''); setData(await loader()); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed'); } finally { setLoading(false); } }, dependencies);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, retry: load };
}
