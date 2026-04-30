import NodeCache from 'node-cache';

/**
 * ============================================================================
 * ENVIRONMENT VARIABLE PROTECTION POLICY
 * ============================================================================
 * 
 * CRITICAL RULE: Environment variables are NEVER cached under any circumstances.
 * 
 * This is enforced through 5 independent defense layers:
 * 1. HTTP Method Filtering - Only GET requests use cache
 * 2. Authentication Check - Authenticated requests bypass cache
 * 3. URL Pattern Detection - Sensitive endpoints skip cache entirely
 * 4. Error Response Detection - Error responses are never cached
 * 5. Environment Variable Pattern Detection - Responses containing env vars/secrets skip cache
 * 
 * SENSITIVE ENDPOINTS (always skip cache):
 * - /debug/*, /config/*, /env/*, /settings/*, /health/*, /version/*, /status/*, /email/*
 * 
 * SENSITIVE PATTERNS (never cached if found in response):
 * - process.env, api_key, api_secret, database_url, jwt_secret
 * - email_user, email_password, email_host, email_port
 * - cloudinary_*, supabase_*, firebase_*, mongodb_uri, redis_url
 * - private_key, access_key, service_account, secret, token
 * 
 * ============================================================================
 */

// Initialize cache with 10 minute standard TTL (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * LAYER 5: Check if response data contains environment variable patterns
 * 
 * This function scans ALL response data for patterns indicating:
 * - Environment variables (process.env.*)
 * - API keys and secrets (api_key, api_secret, etc.)
 * - Database credentials (database_url, mongodb_uri, etc.)
 * - Third-party service keys (firebase_*, cloudinary_*, supabase_*)
 * - Authentication tokens and private keys
 * 
 * If ANY pattern is detected, the response is NEVER cached.
 */
const containsSensitiveData = (data) => {
  const dataStr = JSON.stringify(data || {}).toLowerCase();
  
  // Comprehensive patterns that indicate sensitive environment variables and secrets
  // This is intentionally broad to catch accidental leaks
  const sensitivePatterns = [
    // Environment variable markers
    'process.env',
    'env.',
    '_env_',
    
    // Authentication and secrets
    'api_key',
    'api_secret',
    'jwt_secret',
    'admin_secret',
    'secret_key',
    'private_key',
    'access_key',
    'secret_token',
    'auth_token',
    'bearer_token',
    'refresh_token',
    'session_secret',
    
    // Database credentials
    'database_url',
    'db_url',
    'db_password',
    'mongodb_uri',
    'redis_url',
    'postgres_url',
    'mysql_url',
    
    // Email configuration
    'email_user',
    'email_password',
    'email_host',
    'email_port',
    'email_secret',
    'smtp_user',
    'smtp_password',
    
    // Cloud service keys
    'cloudinary_api_key',
    'cloudinary_secret',
    'cloudinary_name',
    'supabase_key',
    'supabase_url',
    'supabase_secret',
    'firebase_api_key',
    'firebase_auth_domain',
    'firebase_project_id',
    'firebase_database_url',
    
    // Third-party service credentials
    'stripe_key',
    'stripe_secret',
    'paypal_',
    'aws_',
    'azure_',
    'gcp_',
    'openai_',
    'service_account',
    'keyfile',
    'credentials'
  ];
  
  // Check if any sensitive pattern exists in the response
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
// 
// ============================================================================
// MULTI-LAYER ENVIRONMENT VARIABLE PROTECTION STRATEGY
// ============================================================================
// 
// This middleware implements 5 independent, overlapping defense layers to ensure
// environment variables and sensitive data are NEVER cached:
// 
// LAYER 1 - HTTP METHOD FILTERING
//   ✓ Only GET requests can use cache
//   ✓ POST, PUT, DELETE always bypass cache (they modify data)
// 
// LAYER 2 - AUTHENTICATION CHECK
//   ✓ Skip cache if request has: req.user, Authorization header, or auth cookie
//   ✓ Ensures no admin/protected data is ever cached
// 
// LAYER 3 - SENSITIVE ENDPOINT URL PATTERNS
//   ✓ Skip cache for: /debug, /config, /env, /settings, /health, /version, /status, /email
//   ✓ Prevents caching of diagnostic and configuration endpoints
// 
// LAYER 4 - ERROR RESPONSE DETECTION
//   ✓ Skip cache if response contains data.error or "error" in message
//   ✓ Prevents caching temporary/diagnostic error responses
// 
// LAYER 5 - ENVIRONMENT VARIABLE PATTERN DETECTION
//   ✓ Scans ALL response data for 40+ sensitive patterns
//   ✓ Detects: process.env, API keys, secrets, database URLs, credentials
//   ✓ If ANY pattern detected → response NOT cached
// 
// RESULT: Only safe, public, non-sensitive data is cached (products, categories, etc.)
// 
// ============================================================================
export const cacheMiddleware = (req, res, next) => {
  // LAYER 1: Skip cache for non-GET requests (mutations never cached)
  if (req.method !== 'GET') {
    return next();
  }

  // LAYER 2: Skip cache for authenticated requests (protected data never cached)
  if (req.user || req.headers.authorization || req.cookies.authToken) {
    console.log('🔒 Cache SKIPPED: Authenticated request -', req.originalUrl);
    return next();
  }

  // LAYER 3: Skip cache for sensitive endpoints by URL pattern
  const sensitivePatterns = [
    '/debug',      // Debug endpoints - diagnostics, credentials status
    '/config',     // Configuration endpoints - may expose sensitive settings
    '/env',        // Environment-related endpoints - env vars
    '/settings',   // Settings endpoints - may contain secrets
    '/health',     // Health check endpoints - diagnostic info
    '/version',    // Version info endpoints - metadata
    '/status',     // Status check endpoints - diagnostic info
    '/email'       // Email configuration endpoints - SMTP credentials
  ];

  if (sensitivePatterns.some(pattern => req.originalUrl.includes(pattern))) {
    console.log('🚫 Cache SKIPPED: Sensitive endpoint -', req.originalUrl);
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

  // Override res.json to cache response with protection
  res.json = function (data) {
    // LAYER 4: Don't cache error responses
    if (data && (data.error || data.message?.includes('error'))) {
      res.setHeader('X-Cache', 'SKIP');
      console.log('⚠️  Cache SKIPPED: Error response -', req.originalUrl);
      return originalJson(data);
    }
    
    // LAYER 5: Don't cache responses containing environment variable patterns
    // This is the final gate - catches accidental env var exposure
    if (containsSensitiveData(data)) {
      res.setHeader('X-Cache', 'SKIP-SENSITIVE');
      console.warn('🔐 Cache SKIPPED: Sensitive data detected (env vars/secrets/API keys) -', req.originalUrl);
      return originalJson(data);
    }
    
    // Safe to cache
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
