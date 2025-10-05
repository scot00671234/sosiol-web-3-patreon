import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../index';
import { verifyWalletSignature } from '../utils/solana';

const router = Router();

// Get all creators
router.get('/', async (req: Request, res: Response) => {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ 
      error: 'Failed to fetch creators',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get creator by username
router.get('/username/:username', 
  param('username').isString().trim().isLength({ min: 3, max: 30 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const creator = await prisma.creator.findUnique({ where: { username: req.params.username.toLowerCase() } });
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      res.json(creator);
    } catch (error) {
      console.error('Error fetching creator:', error);
      res.status(500).json({ 
        error: 'Failed to fetch creator',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get creator by wallet address
router.get('/wallet/:walletAddress', async (req: Request, res: Response) => {
  try {
    const creator = await prisma.creator.findUnique({ where: { walletAddress: req.params.walletAddress } });
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    res.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    res.status(500).json({ 
      error: 'Failed to fetch creator',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create or update creator profile
router.post('/',
  [
    body('walletAddress').isString().notEmpty(),
    body('username').isString().trim().isLength({ min: 3, max: 30 }),
    body('displayName').isString().trim().isLength({ min: 1, max: 50 }),
    body('bio').optional().isString().isLength({ max: 500 }),
    body('avatarUrl').optional().isString(),
    body('coverImageUrl').optional().isString(),
    body('subscriptionTiers').optional().isArray(),
    body('signature').isString().notEmpty(),
    body('message').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { walletAddress, username, displayName, bio, avatarUrl, coverImageUrl, subscriptionTiers, signature, message } = req.body;

      // Verify wallet signature
      const isValid = await verifyWalletSignature(walletAddress, message, signature);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Check if username is taken by another wallet
      const existingCreator = await prisma.creator.findUnique({ where: { username: username.toLowerCase() } });
      if (existingCreator && existingCreator.walletAddress !== walletAddress) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const creatorData: any = {
        walletAddress,
        username: username.toLowerCase(),
        displayName,
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        coverImageUrl: coverImageUrl || '',
        subscriptionTiers: subscriptionTiers || []
      };

      const creator = await prisma.creator.upsert({
        where: { walletAddress },
        update: creatorData,
        create: creatorData,
      });

      res.json(creator);
    } catch (error) {
      console.error('Error creating/updating creator:', error);
      res.status(500).json({ 
        error: 'Failed to create/update creator',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get creator dashboard stats
router.get('/:walletAddress/dashboard', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const creator = await prisma.creator.findUnique({ where: { walletAddress } });
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Get tips
    const tips = await prisma.tip.findMany({
      where: { toCreatorWallet: walletAddress, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalTipsAgg = await prisma.tip.aggregate({
      _sum: { amountUSDC: true },
      where: { toCreatorWallet: walletAddress, status: 'completed' },
    });

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { creatorWallet: walletAddress, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate monthly recurring revenue (sum of all active subscription prices)
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.priceUSDC, 0);

    // Debug logging
    console.log(`Dashboard data for ${walletAddress}:`, {
      tipsCount: tips.length,
      totalTips: totalTipsAgg._sum.amountUSDC,
      subscriptionsCount: activeSubscriptions.length,
      monthlyRevenue: monthlyRecurringRevenue
    });

    res.json({
      creator: {
        username: creator.username,
        displayName: creator.displayName,
        walletAddress: creator.walletAddress
      },
      stats: {
        totalTipsReceived: totalTipsAgg._sum.amountUSDC || 0,
        totalSubscribers: activeSubscriptions.length,
        monthlyRecurringRevenue: monthlyRecurringRevenue
      },
      recentTips: tips,
      activeSubscriptions: activeSubscriptions.map(sub => ({
        fanWallet: sub.fanWallet,
        tierName: sub.tierName,
        priceUSDC: sub.priceUSDC,
        startDate: sub.startDate,
        nextPaymentDate: sub.nextPaymentDate
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

