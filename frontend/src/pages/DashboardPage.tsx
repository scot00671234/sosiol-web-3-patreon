import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, DollarSign, Settings, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { creatorAPI } from '../utils/api';
import { uploadAPI } from '../utils/uploadAPI';
import BackgroundGlare from '../components/BackgroundGlare';
import AvatarUpload from '../components/AvatarUpload';
import BannerSelector from '../components/BannerSelector';
import bs58 from 'bs58';

interface DashboardStats {
  creator: any;
  stats: {
    totalTipsReceived: number;
  };
  recentTips: any[];
}

const DashboardPage: FC = () => {
  const { publicKey, signMessage: walletSignMessage } = useWallet();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    coverImageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (publicKey) {
      loadDashboard();
    }
  }, [publicKey]);

  // Add refresh function that can be called from other components
  const refreshDashboard = () => {
    if (publicKey) {
      loadDashboard();
    }
  };

  // Check real wallet data
  const checkWalletData = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(`/api/creators/${publicKey.toString()}/wallet-info`);
      const data = await response.json();
      console.log('Real wallet data:', data);
      toast.success(`Real tips: $${data.totalTipsReceived}, Tips count: ${data.recentTips.length}`);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    }
  };

  // Check all tips in database
  const checkAllTips = async () => {
    try {
      const response = await fetch('/api/creators/debug/all-tips');
      const data = await response.json();
      console.log('🔍 All tips in database:', data);
      toast.success(`Database has ${data.totalTips} tips total`);
    } catch (error) {
      console.error('Error fetching all tips:', error);
      toast.error('Failed to fetch all tips');
    }
  };





  // Expose refresh function globally for payment success callbacks
  useEffect(() => {
    (window as any).refreshDashboard = refreshDashboard;
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, [publicKey]);

  const loadDashboard = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      
      // Try to load existing creator profile
      try {
        const response = await creatorAPI.getByWallet(publicKey.toString());
        const creator = response.data;
        
        // Load dashboard
        console.log('🔍 Fetching dashboard data for wallet:', publicKey.toString());
        const dashboardResponse = await creatorAPI.getDashboard(publicKey.toString());
        console.log('📊 Dashboard API response:', dashboardResponse);
        console.log('📊 Dashboard data received:', dashboardResponse.data);
        console.log('📊 Tips in response:', dashboardResponse.data?.recentTips);
        console.log('📊 Total tips:', dashboardResponse.data?.stats?.totalTipsReceived);
        setDashboardData(dashboardResponse.data);
        console.log('✅ Dashboard state updated');
        
        // Populate form
        setProfileForm({
          username: creator.username,
          displayName: creator.displayName,
          bio: creator.bio,
          avatarUrl: creator.avatarUrl,
          coverImageUrl: creator.coverImageUrl || '',
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          // No profile yet, show edit mode
          setIsEditingProfile(true);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!publicKey || !walletSignMessage) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!profileForm.username || !profileForm.displayName) {
      toast.error('Username and display name are required');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving profile...');

    try {
      // Sign a message to verify wallet ownership
      const message = `Sosiol Profile Update: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await walletSignMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      // Handle avatar file upload
      let finalAvatarUrl = profileForm.avatarUrl;
      if (avatarFile) {
        toast.loading('Uploading avatar...', { id: toastId });
        try {
          finalAvatarUrl = await uploadAPI.uploadAvatar(avatarFile);
          toast.loading('Saving profile...', { id: toastId });
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.error('Failed to upload avatar. Using existing image.', { id: toastId });
          // Continue with existing avatar URL if upload fails
        }
      }

      // Save profile
      await creatorAPI.create({
        walletAddress: publicKey.toString(),
        username: profileForm.username,
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        avatarUrl: finalAvatarUrl,
        coverImageUrl: profileForm.coverImageUrl,
        message,
        signature,
      });

      toast.success('Profile saved successfully!', { id: toastId });
      setIsEditingProfile(false);
      loadDashboard();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.error || 'Failed to save profile', { id: toastId });
    } finally {
      setSaving(false);
    }
  };


  const handleAvatarChange = (file: File | null, previewUrl: string | null) => {
    setAvatarFile(file);
    // Update the form with the preview URL for immediate display
    if (previewUrl) {
      setProfileForm({ ...profileForm, avatarUrl: previewUrl });
    }
  };

  const handleBannerChange = (bannerUrl: string) => {
    setProfileForm({ ...profileForm, coverImageUrl: bannerUrl });
  };

  if (!publicKey) {
    return (
      <BackgroundGlare>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-arial mb-4">Connect Your Wallet</h1>
          <p className="text-xl text-gray-600">
            Please connect your Solana wallet to access the dashboard
          </p>
        </div>
      </BackgroundGlare>
    );
  }

  if (loading) {
    return (
      <BackgroundGlare>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      </BackgroundGlare>
    );
  }

  if (isEditingProfile || !dashboardData) {
    return (
      <BackgroundGlare>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {dashboardData ? 'Edit Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-xl text-gray-600">
            Set up your creator profile to start receiving support
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Username *</label>
                <input
                  type="text"
                  placeholder="yourname"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value.toLowerCase() })
                  }
                  className="input"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your unique username (lowercase, no spaces)
                </p>
              </div>

              <div>
                <label className="label">Display Name *</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  placeholder="Tell people about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="input resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profileForm.bio.length}/500 characters
                </p>
              </div>

              <AvatarUpload
                currentAvatarUrl={profileForm.avatarUrl}
                onAvatarChange={handleAvatarChange}
                disabled={saving}
              />

              <BannerSelector
                currentBannerUrl={profileForm.coverImageUrl}
                onBannerChange={handleBannerChange}
                disabled={saving}
              />
            </div>
          </div>


          {/* Actions */}
          <div className="flex justify-end space-x-4">
            {dashboardData && (
              <button
                onClick={() => setIsEditingProfile(false)}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </div>
      </div>
      </BackgroundGlare>
    );
  }

  return (
    <BackgroundGlare>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600">
            Welcome back, {dashboardData.creator.displayName}!
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshDashboard}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={checkWalletData}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <span>Check Wallet</span>
          </button>
          <button
            onClick={checkAllTips}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <span>Check DB</span>
          </button>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tips Received</p>
              <p className="text-3xl font-bold text-primary-600">
                ${dashboardData.stats.totalTipsReceived.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-primary-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Tips */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Tips</h2>
        {dashboardData.recentTips.length === 0 ? (
          <p className="text-gray-600">No tips received yet</p>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentTips.map((tip) => (
              <div
                key={tip._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    ${tip.amountUSDC.toFixed(2)} USDC
                  </p>
                  <p className="text-sm text-gray-600">
                    From: {tip.fromWallet.slice(0, 8)}...{tip.fromWallet.slice(-6)}
                  </p>
                  {tip.message && (
                    <p className="text-sm text-gray-700 mt-1 italic">"{tip.message}"</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(tip.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
    </BackgroundGlare>
  );
};

export default DashboardPage;

