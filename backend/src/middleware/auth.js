import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // First try to get token from cookie, then from Authorization header
  let token = req.cookies.authToken;
  
  if (!token) {
    token = req.headers.authorization?.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
