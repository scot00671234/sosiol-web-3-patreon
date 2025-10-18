import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { creatorAPI } from '../utils/api';
import { formatWalletAddress } from '../utils/solana';
import TipButton from '../components/TipButton';
import BackgroundGlare from '../components/BackgroundGlare';

interface Creator {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  walletAddress: string;
  totalTipsReceived: number;
}

const CreatorPage: FC = () => {
  const { username } = useParams<{ username: string }>();
  const { publicKey } = useWallet();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      loadCreator();
    }
  }, [username]);


  const loadCreator = async () => {
    try {
      setLoading(true);
      const response = await creatorAPI.getByUsername(username!);
      setCreator(response.data);
    } catch (error: any) {
      console.error('Error loading creator:', error);
      toast.error('Creator not found');
    } finally {
      setLoading(false);
    }
  };


  const copyWalletAddress = () => {
    if (creator) {
      navigator.clipboard.writeText(creator.walletAddress);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Creator Not Found</h1>
        <p className="text-xl text-gray-600">
          The creator you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <BackgroundGlare>
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-br from-primary-500 to-primary-700">
        {creator.coverImageUrl && (
          <img
            src={creator.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {creator.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{creator.displayName}</h1>
                <p className="text-xl text-gray-600 mb-4">@{creator.username}</p>
                <p className="text-gray-700 mb-4">{creator.bio}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>${creator.totalTipsReceived.toFixed(2)} in tips received</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3">
                <TipButton
                  creatorWallet={creator.walletAddress}
                  creatorName={creator.displayName}
                  onSuccess={loadCreator}
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Wallet:</span>
                  <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                    {formatWalletAddress(creator.walletAddress, 6)}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyWalletAddress}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://solscan.io/account/${creator.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View on Solscan</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </BackgroundGlare>
  );
};

export default CreatorPage;

