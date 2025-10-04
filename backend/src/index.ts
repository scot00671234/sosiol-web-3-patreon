import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import creatorRoutes from './routes/creator';
import tipRoutes from './routes/tip';
import subscriptionRoutes from './routes/subscription';
import transactionRoutes from './routes/transaction';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/creators', creatorRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve static files from the frontend build
const publicPath = path.join(__dirname, '../public');
console.log('📁 Serving static files from:', publicPath);
console.log('🔍 Checking if public directory exists...');

// Check if the directory exists and list its contents
try {
  const files = fs.readdirSync(publicPath);
  console.log('📂 Public directory contents:', files);
} catch (err) {
  console.error('❌ Public directory not found or not accessible:', err);
}

app.use(express.static(publicPath));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Frontend not available' });
    }
  });
});

// Prisma Client
export const prisma = new PrismaClient();

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

export default app;

