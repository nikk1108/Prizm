// In-memory cache fallback store
const memoryCache = new Map();

/**
 * Get item from cache.
 * @param {string} key 
 */
export const getCache = async (key) => {
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (entry.expiresAt > Date.now()) {
      return entry.value;
    }
    // Delete expired key
    memoryCache.delete(key);
  }
  return null;
};

/**
 * Set item in cache.
 * @param {string} key 
 * @param {any} value 
 * @param {number} [ttlSeconds] Defaults to 300 seconds (5 minutes)
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { value, expiresAt });
  return true;
};

/**
 * Delete item from cache.
 * @param {string} key 
 */
export const delCache = async (key) => {
  memoryCache.delete(key);
  return true;
};

/**
 * Clear the cache entirely.
 */
export const flushCache = async () => {
  memoryCache.clear();
  return true;
};

/**
 * Express middleware helper to cache specific GET endpoints.
 * @param {number} ttlSeconds 
 */
export const cacheMiddleware = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `api-cache:${req.originalUrl || req.url}`;
    try {
      const cachedData = await getCache(key);
      if (cachedData) {
        console.log(`[Cache Hit] Serving response for key: ${key}`);
        return res.json(cachedData);
      }

      // Override res.json to capture response and set cache
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, ttlSeconds).catch(err => {
            console.error(`[Cache Error] Failed to write key ${key}: ${err.message}`);
          });
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.warn(`[Cache Error] Bypassing cache: ${error.message}`);
      next();
    }
  };
};
