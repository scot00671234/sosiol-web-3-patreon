import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import creatorRoutes from './routes/creator';
import tipRoutes from './routes/tip';
import transactionRoutes from './routes/transaction';
import uploadRoutes from './routes/upload';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/creators', creatorRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files from the frontend build
// In nixpacks: backend runs from /app/backend/, so we need to go up to /app/ then into frontend/dist/
let publicPath = path.join(__dirname, '../../frontend/dist');
console.log('📁 Serving static files from:', publicPath);
console.log('🔍 Checking if public directory exists...');
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 __dirname:', __dirname);

// Check if the directory exists and list its contents
try {
  const files = fs.readdirSync(publicPath);
  console.log('📂 Public directory contents:', files);
} catch (err) {
  console.error('❌ Public directory not found or not accessible:', err);
  // Try alternative paths
  const altPath1 = path.join(__dirname, '../frontend/dist');
  const altPath2 = path.join(process.cwd(), 'frontend/dist');
  console.log('🔍 Trying alternative path 1:', altPath1);
  console.log('🔍 Trying alternative path 2:', altPath2);
  
  // Try to find the correct path
  if (fs.existsSync(altPath1)) {
    publicPath = altPath1;
    console.log('✅ Using alternative path 1:', publicPath);
  } else if (fs.existsSync(altPath2)) {
    publicPath = altPath2;
    console.log('✅ Using alternative path 2:', publicPath);
  } else {
    console.error('❌ No public directory found in any expected location');
  }
}

app.use(express.static(publicPath));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Frontend not available' });
    }
  });
});

// Prisma Client
export const prisma = new PrismaClient();

// Run database setup on startup
const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up database...');
    
    // Clear any failed migrations
    try {
      await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE finished_at IS NULL;`;
      console.log('✅ Cleared failed migrations');
    } catch (error) {
      console.log('ℹ️ No migrations table or no failed migrations to clear');
    }
    
    // Create TipStatus enum if it doesn't exist
    try {
      await prisma.$executeRaw`CREATE TYPE "TipStatus" AS ENUM ('pending', 'completed', 'failed');`;
      console.log('✅ Created TipStatus enum');
    } catch (error) {
      console.log('ℹ️ TipStatus enum already exists');
    }
    
    // Check if Creator table exists
    const creatorTableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Creator'
      );
    `;
    
    if (!creatorTableExists[0]?.exists) {
      console.log('📋 Creating database tables...');
      
      // Create the Creator table
      await prisma.$executeRaw`
        CREATE TABLE "Creator" (
          "id" SERIAL NOT NULL,
          "walletAddress" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "displayName" TEXT NOT NULL,
          "bio" TEXT NOT NULL DEFAULT '',
          "avatarUrl" TEXT NOT NULL DEFAULT '',
          "coverImageUrl" TEXT NOT NULL DEFAULT '',
          "totalTipsReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
        );
      `;
      
      // Create the Tip table
      await prisma.$executeRaw`
        CREATE TABLE "Tip" (
          "id" SERIAL NOT NULL,
          "fromWallet" TEXT NOT NULL,
          "toCreatorWallet" TEXT NOT NULL,
          "amountUSDC" DOUBLE PRECISION NOT NULL,
          "transactionSignature" TEXT NOT NULL,
          "message" TEXT,
          "status" "TipStatus" NOT NULL DEFAULT 'pending',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
        );
      `;
      
      // Create indexes
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Creator_walletAddress_key" ON "Creator"("walletAddress");`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Tip_transactionSignature_key" ON "Tip"("transactionSignature");`;
      
      // Add foreign key
      await prisma.$executeRaw`ALTER TABLE "Tip" ADD CONSTRAINT "Tip_toCreatorWallet_fkey" FOREIGN KEY ("toCreatorWallet") REFERENCES "Creator"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;`;
      
      console.log('✅ Database tables created successfully!');
    } else {
      console.log('ℹ️ Database tables already exist');
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    // Don't exit - let the app continue
  }
};

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
    
    // Setup database
    await setupDatabase();
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

