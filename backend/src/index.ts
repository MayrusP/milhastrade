import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import offerRoutes from './routes/offerRoutes';
import transactionRoutes from './routes/transactionRoutes';
import userRoutes from './routes/userRoutes';
import verificationRoutes from './routes/verificationRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Basic health check route
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Plataforma de Troca de Milhas API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    code: 'NOT_FOUND',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation:`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   Offers: http://localhost:${PORT}/api/offers`);
  console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`   Users: http://localhost:${PORT}/api/users`);
  console.log(`   Verification: http://localhost:${PORT}/api/verification`);
});