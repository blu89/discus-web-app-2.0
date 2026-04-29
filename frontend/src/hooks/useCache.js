import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for caching API responses in memory on the client side
 * Useful for frequently accessed data
 */
const memoryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const useCache = (key, fetcher, duration = CACHE_DURATION) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkCache = () => {
      const cached = memoryCache.get(key);
      
      if (cached && Date.now() - cached.timestamp < duration) {
        // Use cached data
        if (isMounted.current) {
          setData(cached.data);
          setLoading(false);
        }
        return true;
      }
      
      return false;
    };

    if (checkCache()) {
      return;
    }

    // Fetch fresh data
    const fetchData = async () => {
      try {
        const result = await fetcher();
        
        // Cache the result
        memoryCache.set(key, {
          data: result,
          timestamp: Date.now()
        });

        if (isMounted.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err);
          // Try to use stale cache on error
          const staleCache = memoryCache.get(key);
          if (staleCache) {
            setData(staleCache.data);
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [key, fetcher, duration]);

  const invalidate = () => {
    memoryCache.delete(key);
  };

  return { data, loading, error, invalidate };
};

/**
 * Clear all memory cache
 */
export const clearMemoryCache = () => {
  memoryCache.clear();
};

/**
 * Get cache info for debugging
 */
export const getCacheInfo = () => {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys())
  };
};
