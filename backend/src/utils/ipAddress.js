/**
 * Extract client IP address from request
 * Handles proxies and reverse proxies
 */
export const getClientIpAddress = (req) => {
  // Check for IP from reverse proxy (Render, Vercel, etc.)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  // Check for other proxy headers
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }
  
  if (req.headers['x-client-ip']) {
    return req.headers['x-client-ip'];
  }
  
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fallback to socket address
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
};
