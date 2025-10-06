import { FC, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Heart, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUSDCTransferTransaction } from '../utils/solana';
import { subscriptionAPI } from '../utils/api';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  priceUSDC: number;
  benefits: string[];
}

interface SubscribeButtonProps {
  creatorWallet: string;
  tiers: SubscriptionTier[];
  currentSubscription?: any;
  onSuccess?: () => void;
}

const SubscribeButton: FC<SubscribeButtonProps> = ({
  creatorWallet,
  tiers,
  currentSubscription,
  onSuccess,
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Processing subscription...`);

    try {
      // Create transaction for first month payment
      const transaction = await createUSDCTransferTransaction(
        connection,
        publicKey,
        new PublicKey(creatorWallet),
        tier.priceUSDC
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Create subscription in backend
      console.log('Creating subscription in backend:', {
        fanWallet: publicKey.toString(),
        creatorWallet,
        tierId: tier.id,
        transactionSignature: signature,
      });
      
      const subscriptionData = {
        fanWallet: publicKey.toString(),
        creatorWallet,
        tierId: tier.id,
        transactionSignature: signature,
      };
      
      console.log('Sending subscription data:', subscriptionData);
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subscription created successfully:', result);
        toast.success(`Successfully subscribed to ${tier.name}!`);
      } else {
        const error = await response.json();
        console.error('❌ Failed to create subscription:', error);
        toast.error(`Subscription failed: ${error.error || 'Unknown error'}`);
        throw new Error(error.error || 'Subscription failed');
      }

      toast.success(`Successfully subscribed to ${tier.name}!`, { id: toastId });
      setIsOpen(false);
      onSuccess?.();
      
      // Refresh dashboard if available
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to subscribe';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!publicKey || !currentSubscription) return;

    setLoading(true);
    const toastId = toast.loading('Cancelling subscription...');

    try {
      await subscriptionAPI.cancel({
        fanWallet: publicKey.toString(),
        creatorWallet,
      });

      toast.success('Subscription cancelled', { id: toastId });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (currentSubscription) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary flex items-center space-x-2"
      >
        <Check className="h-5 w-5" />
        <span>Subscribed</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center space-x-2"
        disabled={!publicKey || tiers.length === 0}
      >
        <Heart className="h-5 w-5" />
        <span>Subscribe</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {currentSubscription ? 'Manage Subscription' : 'Choose a Tier'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {currentSubscription ? (
              <div className="space-y-4">
                <div className="card bg-primary-50 border-primary-200">
                  <h3 className="font-bold text-lg mb-2">{currentSubscription.tierName}</h3>
                  <p className="text-gray-600 mb-4">
                    ${currentSubscription.priceUSDC}/month
                  </p>
                  <p className="text-sm text-gray-500">
                    Next payment: {new Date(currentSubscription.nextPaymentDate).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="btn btn-secondary w-full"
                >
                  {loading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tiers.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    This creator hasn't set up subscription tiers yet.
                  </p>
                ) : (
                  tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`card cursor-pointer transition-all ${
                        selectedTier?.id === tier.id
                          ? 'border-primary-500 ring-2 ring-primary-500'
                          : 'hover:border-primary-300'
                      }`}
                      onClick={() => setSelectedTier(tier)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{tier.name}</h3>
                          <p className="text-gray-600 text-sm">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            ${tier.priceUSDC}
                          </div>
                          <div className="text-xs text-gray-500">per month</div>
                        </div>
                      </div>

                      {tier.benefits.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Benefits:</p>
                          <ul className="space-y-1">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <Check className="h-4 w-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedTier?.id === tier.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe(tier);
                          }}
                          disabled={loading}
                          className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Heart className="h-5 w-5" />
                              <span>Subscribe for ${tier.priceUSDC}/month</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribeButton;

