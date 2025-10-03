import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { verifyTransaction } from '../utils/solana';

const router = Router();

// Record a tip
router.post('/',
  [
    body('fromWallet').isString().notEmpty(),
    body('toCreatorWallet').isString().notEmpty(),
    body('amountUSDC').isNumeric().custom((value) => value > 0),
    body('transactionSignature').isString().notEmpty(),
    body('message').optional().isString().isLength({ max: 280 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fromWallet, toCreatorWallet, amountUSDC, transactionSignature, message } = req.body;

      // Check if tip already exists
      const existingTip = await prisma.tip.findUnique({ where: { transactionSignature } });
      if (existingTip) {
        return res.json(existingTip);
      }

      // Verify transaction on Solana
      const isValid = await verifyTransaction(transactionSignature, fromWallet, toCreatorWallet, amountUSDC);
      
      const tip = await prisma.tip.create({
        data: {
          fromWallet,
          toCreatorWallet,
          amountUSDC,
          transactionSignature,
          message: message || '',
          status: isValid ? 'completed' : 'pending',
        }
      });

      // Update creator stats
      if (isValid) {
        await prisma.creator.update({
          where: { walletAddress: toCreatorWallet },
          data: { totalTipsReceived: { increment: amountUSDC } },
        });
      }

      res.status(201).json(tip);
    } catch (error) {
      console.error('Error recording tip:', error);
      res.status(500).json({ error: 'Failed to record tip' });
    }
  }
);

// Get tips for a creator
router.get('/creator/:walletAddress', async (req: Request, res: Response) => {
  try {
    const tips = await prisma.tip.findMany({
      where: { toCreatorWallet: req.params.walletAddress, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(tips);
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// Get tips from a fan
router.get('/fan/:walletAddress', async (req: Request, res: Response) => {
  try {
    const tips = await prisma.tip.findMany({
      where: { fromWallet: req.params.walletAddress, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(tips);
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

export default router;

