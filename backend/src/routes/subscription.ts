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
      const creator = await prisma.creator.findUnique({ where: { walletAddress: creatorWallet } });
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      const tier = (creator as any).subscriptionTiers.find((t: any) => t.id === tierId);
      if (!tier) {
        return res.status(404).json({ error: 'Subscription tier not found' });
      }

      // Verify transaction
      console.log(`Verifying subscription transaction: ${transactionSignature}`);
      const isValid = await verifyTransaction(transactionSignature, fanWallet, creatorWallet, tier.priceUSDC);
      console.log(`Subscription verification result: ${isValid}`);
      
      if (!isValid) {
        console.log('Subscription transaction verification failed');
        return res.status(400).json({ error: 'Invalid transaction' });
      }

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

export default router;

