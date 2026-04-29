import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import productTypeRoutes from './routes/productTypes.js';
import supplierRoutes from './routes/suppliers.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import heroRoutes from './routes/hero.js';
import reviewRoutes from './routes/reviews.js';
import { systemRoutes } from './routes/system.js';
import { cacheMiddleware } from './utils/cache.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for global access
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://discus-web-app-2-0.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173' // Vite dev server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Security headers middleware
app.use((req, res, next) => {
  // Prevent exposing sensitive information
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Hide server info
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');
  
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cacheMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/reviews', reviewRoutes);

// System routes (health check, 404, error handler)
systemRoutes(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('By ciphertech');
});

// Export for Vercel serverless
export default app;
