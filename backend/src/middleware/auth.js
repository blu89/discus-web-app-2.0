import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Try multiple sources for token (in order of preference)
  let token = req.cookies.authToken; // First: HTTP-only cookie (most secure)
  
  if (!token) {
    token = req.headers.authorization?.split(' ')[1]; // Second: Authorization header
  }

  if (!token) {
    console.log('No auth token found in cookies or headers');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
