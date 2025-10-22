import { Router, Request, Response } from 'express';
import { param } from 'express-validator';
import { getTransactionDetails } from '../utils/solana';

const router = Router();

// Get transaction details
router.get('/:signature', 
  param('signature').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const { signature } = req.params;
      const details = await getTransactionDetails(signature);
      
      if (!details) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(details);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }
);

export default router;

