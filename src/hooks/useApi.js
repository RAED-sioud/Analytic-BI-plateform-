import { useState, useEffect } from 'react';

export default function useApi(url, fallback = []) {
  const [data, setData]       = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (!cancelled) {
          setData(Array.isArray(json) ? json : json.error ? fallback : json);
          setLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [url]); // eslint-disable-line

  return { data, loading, error };
}
