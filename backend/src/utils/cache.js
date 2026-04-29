import NodeCache from 'node-cache';

// Initialize cache with 10 minute standard TTL (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Cache key generators
export const cacheKeys = {
  allProducts: 'products:all',
  productById: (id) => `product:${id}`,
  allCategories: 'categories:all',
  categoryById: (id) => `category:${id}`,
  allProductTypes: 'productTypes:all',
  productTypeById: (id) => `productType:${id}`,
  allSuppliers: 'suppliers:all',
  supplierById: (id) => `supplier:${id}`,
  allHero: 'hero:all',
  heroById: (id) => `hero:${id}`,
  productReviews: (id) => `reviews:product:${id}`,
  allReviews: 'reviews:all',
};

// Get cached value
export const getCache = (key) => {
  return cache.get(key);
};

// Set cache value with custom TTL
export const setCache = (key, value, ttl = 600) => {
  cache.set(key, value, ttl);
};

// Delete specific cache key
export const deleteCache = (key) => {
  cache.del(key);
};

// Delete multiple cache keys by pattern
export const deleteCacheByPattern = (pattern) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

// Clear all cache
export const clearAllCache = () => {
  cache.flushAll();
};

// Cache middleware for GET requests
export const cacheMiddleware = (req, res, next) => {
  // Skip cache for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const cachedData = cache.get(key);

  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to cache response
  res.json = function (data) {
    cache.set(key, data);
    res.setHeader('X-Cache', 'MISS');
    return originalJson(data);
  };

  next();
};

// Set HTTP caching headers
export const setCacheHeaders = (req, res, options = {}) => {
  const {
    maxAge = 3600, // 1 hour
    isPublic = true,
    mustRevalidate = false,
  } = options;

  const cacheControl = [];
  if (isPublic) {
    cacheControl.push('public');
  } else {
    cacheControl.push('private');
  }
  cacheControl.push(`max-age=${maxAge}`);
  if (mustRevalidate) {
    cacheControl.push('must-revalidate');
  }

  res.setHeader('Cache-Control', cacheControl.join(', '));
  res.setHeader('ETag', `"${Date.now()}"`);
};

// Set cache headers for static/frequently accessed data
export const setStaticCacheHeaders = (req, res) => {
  setCacheHeaders(req, res, {
    maxAge: 3600, // 1 hour
    isPublic: true,
    mustRevalidate: false,
  });
};

// Set no-cache headers for dynamic data
export const setNoCacheHeaders = (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

export default cache;
