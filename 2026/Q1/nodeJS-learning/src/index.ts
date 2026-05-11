// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { connectionDatabase } from '@/shared/utils/db';
import cors from 'cors';
import express, { Application } from 'express';

// Import feature routes
import adminRoutes from '@/features/admin/routes/admin.routes';
import authRoutes from '@/features/auth/routes/auth.routes';
import ordersRoutes from '@/features/orders/routes/orders.routes';
import productsRoutes from '@/features/products/routes/products.routes';
import { responseMiddleware } from '@/shared/middlewares/response.middleware';
import { errorHandler, handleUncaughtException, handleUnhandledRejection, notFound } from '@/shared/utils/error';

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Database connection
connectionDatabase();

// Initialize Express app
const app: Application = express();
const PORT: string | number = process.env.PORT || 3000;

// Recommended CORS configuration for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add metadata to all API responses
app.use('/api', responseMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    message: 'E-commerce API with Feature-Based Architecture',
    version: '2.0.0',
    features: [
      'Authentication & Authorization',
      'Product Management',
      'Order Management',
      'Admin Dashboard & Analytics',
      'User Management (Admin)',
      'Joi Validation Decorators',
      'Feature-Based Architecture'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

// Feature-based API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, (): void => {
    console.log(`Server connected at Port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  server.close(() => {
    handleUnhandledRejection(err);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
