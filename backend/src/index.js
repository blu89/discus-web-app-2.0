import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
import chatRoutes from './routes/chat.js';
import { systemRoutes } from './routes/system.js';
import { cacheMiddleware } from './utils/cache.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'https://charlesthompsondiscus.com',
      'http://localhost:3000',
      'http://localhost:5173' // Vite dev server
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for global access
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://charlesthompsondiscus.com',
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
app.use('/api/chat', chatRoutes);

// Socket.IO connection handling
const activeUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('New Socket.IO connection:', socket.id);

  socket.on('user_connect', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    io.emit('user_online', { userId, timestamp: new Date().toISOString() });
  });

  socket.on('send_message', async (data) => {
    const { conversationId, senderId, senderType, message, imageUrl } = data;
    
    try {
      // Emit to both customer and admin in the conversation
      io.to(`conversation_${conversationId}`).emit('receive_message', {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        message_text: message,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  });

  socket.on('typing', (data) => {
    const { conversationId, userId, isTyping } = data;
    io.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      isTyping,
    });
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit('user_offline', { userId, timestamp: new Date().toISOString() });
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});

// System routes (health check, 404, error handler)
systemRoutes(app);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('By ciphertech');
});

// Export for Vercel serverless
export default app;
