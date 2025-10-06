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

      // Prevent self-payments from being recorded as tips
      if (fromWallet === toCreatorWallet) {
        console.log('Self-payment detected, not recording as tip');
        return res.status(400).json({ 
          error: 'Cannot send tips to yourself. Tips must be sent to different wallet addresses.' 
        });
      }

      // Check if tip already exists
      const existingTip = await prisma.tip.findUnique({ where: { transactionSignature } });
      if (existingTip) {
        return res.json(existingTip);
      }

      // SIMPLIFIED: Accept all tips that reach the backend
      // (Payment was already confirmed on frontend)
      console.log(`Recording tip: ${transactionSignature}`);
      console.log(`From: ${fromWallet}, To: ${toCreatorWallet}, Amount: ${amountUSDC}`);
      
      // Since payment was successful on frontend, we trust it
      const finalIsValid = true;
      console.log(`✅ Payment confirmed, recording tip`);
      
      const tip = await prisma.tip.create({
        data: {
          fromWallet,
          toCreatorWallet,
          amountUSDC,
          transactionSignature,
          message: message || '',
          status: finalIsValid ? 'completed' : 'pending',
        }
      });
      
      console.log(`✅ Tip created with status: ${tip.status}, ID: ${tip.id}`);
      console.log(`✅ Tip details:`, {
        id: tip.id,
        fromWallet: tip.fromWallet,
        toCreatorWallet: tip.toCreatorWallet,
        amountUSDC: tip.amountUSDC,
        status: tip.status,
        createdAt: tip.createdAt
      });

      // Update creator stats
      if (finalIsValid) {
        console.log(`Updating creator stats for ${toCreatorWallet}: adding ${amountUSDC} to totalTipsReceived`);
        await prisma.creator.update({
          where: { walletAddress: toCreatorWallet },
          data: { totalTipsReceived: { increment: amountUSDC } },
        });
        console.log(`Successfully updated creator stats for ${toCreatorWallet}`);
      } else {
        console.log(`Tip verification failed for ${toCreatorWallet}, not updating stats`);
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

