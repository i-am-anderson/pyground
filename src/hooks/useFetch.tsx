import { useEffect, useState } from "react";

type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

const CACHE_TIME = 5 * 60 * 1000;

function useFetch<T>({ url }: { url: string }): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const cacheKey = `fetch_cache_${url}`;

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { value, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_TIME;

      if (!isExpired) {
        setData(value);
        setLoading(false);
        return;
      }
    }

    const controller = new AbortController();
    const signal = controller.signal;

    fetch(`${url}`, { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const cachePayload = {
          value: data,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));

        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setError(error);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
