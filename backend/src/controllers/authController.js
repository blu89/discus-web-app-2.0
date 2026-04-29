import supabase from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        role: 'customer'
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const token = generateToken({ ...data[0], role: 'customer' });
    setAuthCookie(res, token);
    
    // Also return token in response for localStorage fallback
    res.status(201).json({ user: data[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);
    
    // Also return token in response for localStorage fallback
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, fullName, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        role: 'admin'
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const token = generateToken({ ...data[0], role: 'admin' });
    setAuthCookie(res, token);
    
    // Also return token in response for localStorage fallback
    res.status(201).json({ user: data[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Not an admin account' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);
    
    // Also return token in response for localStorage fallback
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
};

export const verifyAuth = (req, res) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true, user: decoded });
  } catch (error) {
    res.clearCookie('authToken');
    res.status(401).json({ authenticated: false });
  }
};
