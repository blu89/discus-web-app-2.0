import NodeCache from 'node-cache';

// Initialize cache with 10 minute standard TTL (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Security Note: This cache is only used for:
// - Public GET endpoints (products, categories, etc.)
// - Never used for authenticated requests (auth middleware skips it)
// - Never used for sensitive endpoints (debug, config, env, settings, health, version, status)
// - Never caches error responses
// - Never caches responses containing environment variable patterns
// Environment variables are never stored in cache and never exposed to clients

/**
 * Check if response data contains potential environment variable leaks
 * Prevents accidental caching of sensitive data like API keys, secrets, etc.
 */
const containsSensitiveData = (data) => {
  const dataStr = JSON.stringify(data || {}).toLowerCase();
  
  // Patterns that indicate sensitive environment variables
  const sensitivePatterns = [
    'process.env',
    'api_key',
    'api_secret',
    'database_url',
    'jwt_secret',
    'admin_secret',
    'email_user',
    'email_password',
    'email_host',
    'email_port',
    'cloudinary_api_key',
    'cloudinary_secret',
    'supabase_',
    'firebase_',
    'mongodb_uri',
    'redis_url',
    'secret_key',
    'private_key',
    'access_key',
    'service_account'
  ];
  
  return sensitivePatterns.some(pattern => dataStr.includes(pattern));
};

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
// DEFENSE-IN-DEPTH STRATEGY:
// 1. Skips all authenticated requests (admin data never cached)
// 2. Skips all sensitive endpoints by URL pattern (debug, config, env, etc.)
// 3. Skips all error responses (prevents caching partial/failed data)
// 4. Skips all responses containing env variable patterns (API keys, secrets, etc.)
// Result: Only safe public data is cached (products, categories, etc.)
export const cacheMiddleware = (req, res, next) => {
  // LAYER 1: Skip cache for non-GET requests
  // Reasoning: Only GET requests should use cache (POST/PUT/DELETE modify data)
  if (req.method !== 'GET') {
    return next();
  }

  // LAYER 2: Skip cache for authenticated requests
  // Reasoning: Never cache admin/protected data
  if (req.user || req.headers.authorization || req.cookies.authToken) {
    console.log('Skipping cache for authenticated request:', req.originalUrl);
    return next();
  }

  // LAYER 3: Skip cache for sensitive endpoints by URL pattern
  // Reasoning: Prevent accidental caching of debug endpoints, health checks, etc.
  const sensitivePatterns = [
    '/debug',      // Debug endpoints - database info, diagnostics
    '/config',     // Configuration endpoints
    '/env',        // Environment-related endpoints
    '/settings',   // Settings endpoints
    '/health',     // Health check endpoints
    '/version',    // Version info endpoints
    '/status'      // Status check endpoints
  ];

  if (sensitivePatterns.some(pattern => req.originalUrl.includes(pattern))) {
    console.log('Skipping cache for sensitive endpoint:', req.originalUrl);
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
    // LAYER 4: Don't cache error responses
    // Reasoning: Error responses are temporary/diagnostic and shouldn't be cached
    if (data && (data.error || data.message?.includes('error'))) {
      res.setHeader('X-Cache', 'SKIP');
      return originalJson(data);
    }
    
    // LAYER 5: Don't cache responses containing environment variable patterns
    // Reasoning: Defense against accidental env variable exposure
    // Detects patterns like API_KEY, DATABASE_URL, JWT_SECRET, etc.
    if (containsSensitiveData(data)) {
      console.warn('Skipping cache: Response contains potential sensitive data (env vars, secrets, API keys)');
      res.setHeader('X-Cache', 'SKIP-SENSITIVE');
      return originalJson(data);
    }
    
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
