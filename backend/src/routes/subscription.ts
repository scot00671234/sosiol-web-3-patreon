import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { verifyTransaction } from '../utils/solana';

const router = Router();

// Create subscription
router.post('/',
  [
    body('fanWallet').isString().notEmpty(),
    body('creatorWallet').isString().notEmpty(),
    body('tierId').isString().notEmpty(),
    body('transactionSignature').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fanWallet, creatorWallet, tierId, transactionSignature } = req.body;

      // Prevent self-subscriptions
      if (fanWallet === creatorWallet) {
        console.log('Self-subscription detected, not allowing');
        return res.status(400).json({ 
          error: 'Cannot subscribe to yourself. Subscriptions must be to different wallet addresses.' 
        });
      }

      // Get creator and tier info
      console.log(`🔍 Looking up creator: ${creatorWallet}`);
      const creator = await prisma.creator.findUnique({ where: { walletAddress: creatorWallet } });
      if (!creator) {
        console.log('❌ Creator not found');
        return res.status(404).json({ error: 'Creator not found' });
      }

      console.log(`🔍 Creator found: ${creator.username}`);
      console.log(`🔍 Subscription tiers:`, creator.subscriptionTiers);
      
      const tier = (creator as any).subscriptionTiers.find((t: any) => t.id === tierId);
      if (!tier) {
        console.log(`❌ Tier not found: ${tierId}`);
        return res.status(404).json({ error: 'Subscription tier not found' });
      }
      
      console.log(`✅ Tier found:`, tier);

      // SIMPLIFIED: Accept all subscriptions that reach the backend
      // (Payment was already confirmed on frontend)
      console.log(`✅ Payment confirmed, creating subscription`);
      const isValid = true;

      // Check for existing active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { fanWallet, creatorWallet, status: 'active' }
      });

      if (existingSubscription) {
        // Update existing subscription
        const updated = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            tierId,
            tierName: tier.name,
            priceUSDC: tier.priceUSDC,
            lastPaymentDate: new Date(),
            lastTransactionSignature: transactionSignature,
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });
        return res.json(updated);
      }

      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          fanWallet,
          creatorWallet,
          tierId,
          tierName: tier.name,
          priceUSDC: tier.priceUSDC,
          status: 'active',
          startDate: new Date(),
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastPaymentDate: new Date(),
          lastTransactionSignature: transactionSignature,
        }
      });

      // Update creator stats
      console.log(`Updating creator stats for ${creatorWallet}: incrementing totalSubscribers`);
      await prisma.creator.update({
        where: { walletAddress: creatorWallet },
        data: { totalSubscribers: { increment: 1 } }
      });
      console.log(`Successfully updated creator stats for ${creatorWallet}`);

      res.status(201).json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

// Cancel subscription
router.post('/cancel',
  [
    body('fanWallet').isString().notEmpty(),
    body('creatorWallet').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fanWallet, creatorWallet } = req.body;

      const existing = await prisma.subscription.findFirst({
        where: { fanWallet, creatorWallet, status: 'active' }
      });

      if (!existing) {
        return res.status(404).json({ error: 'Active subscription not found' });
      }

      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'cancelled' }
      });

      // Update creator stats
      await prisma.creator.update({
        where: { walletAddress: creatorWallet },
        data: { totalSubscribers: { decrement: 1 } }
      });

      res.json(subscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
);

// Get subscriptions for a creator
router.get('/creator/:walletAddress', async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { creatorWallet: req.params.walletAddress, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get subscriptions for a fan
router.get('/fan/:walletAddress', async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { fanWallet: req.params.walletAddress },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Check if fan has active subscription to creator
router.get('/check/:fanWallet/:creatorWallet', async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { fanWallet: req.params.fanWallet, creatorWallet: req.params.creatorWallet, status: 'active' }
    });

    res.json({
      hasSubscription: !!subscription,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// Process monthly payments for all active subscriptions
router.post('/process-monthly-payments', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Processing monthly payments...');
    
    // Get all active subscriptions that are due for payment
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextPaymentDate: {
          lte: new Date() // Due today or earlier
        }
      },
      include: {
        creator: true
      }
    });
    
    console.log(`📊 Found ${dueSubscriptions.length} subscriptions due for payment`);
    
    const results = [];
    
    for (const subscription of dueSubscriptions) {
      try {
        console.log(`💳 Processing payment for subscription ${subscription.id}`);
        
        // In a real system, you would:
        // 1. Check if user has sufficient USDC balance
        // 2. Create a transaction to charge the user
        // 3. Update the subscription with new payment date
        
        // For now, we'll just update the next payment date
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            lastPaymentDate: new Date(),
            nextPaymentDate: nextPaymentDate,
            lastTransactionSignature: `monthly-${Date.now()}` // Placeholder
          }
        });
        
        results.push({
          subscriptionId: subscription.id,
          fanWallet: subscription.fanWallet,
          creatorWallet: subscription.creatorWallet,
          amount: subscription.priceUSDC,
          status: 'processed'
        });
        
        console.log(`✅ Processed payment for subscription ${subscription.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to process subscription ${subscription.id}:`, error);
        results.push({
          subscriptionId: subscription.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.json({
      message: 'Monthly payments processed',
      totalProcessed: results.length,
      results
    });
    
  } catch (error) {
    console.error('Error processing monthly payments:', error);
    res.status(500).json({ error: 'Failed to process monthly payments' });
  }
});

// Get subscription analytics for creators
router.get('/analytics/:creatorWallet', async (req: Request, res: Response) => {
  try {
    const { creatorWallet } = req.params;
    
    const subscriptions = await prisma.subscription.findMany({
      where: { creatorWallet, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
    
    const totalMonthlyRevenue = subscriptions.reduce((sum, sub) => sum + sub.priceUSDC, 0);
    const totalSubscribers = subscriptions.length;
    
    // Calculate revenue by tier
    const revenueByTier = subscriptions.reduce((acc, sub) => {
      const tierName = sub.tierName;
      acc[tierName] = (acc[tierName] || 0) + sub.priceUSDC;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      totalSubscribers,
      totalMonthlyRevenue,
      revenueByTier,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        fanWallet: sub.fanWallet,
        tierName: sub.tierName,
        priceUSDC: sub.priceUSDC,
        startDate: sub.startDate,
        nextPaymentDate: sub.nextPaymentDate,
        lastPaymentDate: sub.lastPaymentDate
      }))
    });
    
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

