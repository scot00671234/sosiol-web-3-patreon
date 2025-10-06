import { FC, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUSDCTransferTransaction } from '../utils/solana';
import { QUICK_TIP_AMOUNTS } from '../config/constants';

interface TipButtonProps {
  creatorWallet: string;
  creatorName: string;
  onSuccess?: () => void;
}

const TipButton: FC<TipButtonProps> = ({ creatorWallet, creatorName, onSuccess }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isOpen, setIsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTip = async (amount: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Sending ${amount} USDC tip...`);

    try {
      // Create transaction
      const transaction = await createUSDCTransferTransaction(
        connection,
        publicKey,
        new PublicKey(creatorWallet),
        amount
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Record tip in backend - SIMPLIFIED APPROACH
      console.log('Payment successful! Recording tip:', {
        fromWallet: publicKey.toString(),
        toCreatorWallet: creatorWallet,
        amountUSDC: amount,
        transactionSignature: signature,
      });
      
      // Simple direct API call - no complex verification
      const tipData = {
        fromWallet: publicKey.toString(),
        toCreatorWallet: creatorWallet,
        amountUSDC: amount,
        transactionSignature: signature,
        message: message || '',
      };
      
      console.log('Sending tip data to backend:', tipData);
      
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Tip recorded successfully:', result);
        toast.success(`Tip of $${amount} USDC recorded!`);
        
        // Force refresh dashboard after successful tip recording
        console.log('🔄 Refreshing dashboard after tip recording...');
        if ((window as any).refreshDashboard) {
          (window as any).refreshDashboard();
        }
      } else {
        const error = await response.json();
        console.error('❌ Failed to record tip:', error);
        toast.error(`Tip sent but recording failed: ${error.error || 'Unknown error'}`);
      }

      toast.success(`Successfully sent ${amount} USDC to ${creatorName}!`, { id: toastId });
      setIsOpen(false);
      setCustomAmount('');
      setMessage('');
      onSuccess?.();
      
      // Refresh dashboard if available
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
    } catch (error: any) {
      console.error('Error sending tip:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send tip';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center space-x-2"
        disabled={!publicKey}
      >
        <DollarSign className="h-5 w-5" />
        <span>Send Tip</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Send a Tip</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div>
              <p className="text-gray-600 mb-4">
                Support <span className="font-semibold">{creatorName}</span> with USDC
              </p>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {QUICK_TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTip(amount)}
                    disabled={loading}
                    className="btn btn-outline hover:scale-105 transform transition-transform"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="space-y-4">
                <div>
                  <label className="label">Custom Amount (USDC)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="input"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>

                {/* Optional message */}
                <div>
                  <label className="label">Message (Optional)</label>
                  <textarea
                    placeholder="Leave a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input resize-none"
                    rows={3}
                    maxLength={280}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/280 characters
                  </p>
                </div>

                <button
                  onClick={() => handleTip(parseFloat(customAmount))}
                  disabled={loading || !customAmount || parseFloat(customAmount) <= 0}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      <span>Send ${customAmount || '0'} USDC</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TipButton;

