import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, Users, DollarSign, TrendingUp, Settings, Plus, Trash2 } from 'lucide-react';
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
    totalSubscribers: number;
    monthlyRecurringRevenue: number;
  };
  recentTips: any[];
  activeSubscriptions: any[];
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
  const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (publicKey) {
      loadDashboard();
    }
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
        const dashboardResponse = await creatorAPI.getDashboard(publicKey.toString());
        setDashboardData(dashboardResponse.data);
        
        // Populate form
        setProfileForm({
          username: creator.username,
          displayName: creator.displayName,
          bio: creator.bio,
          avatarUrl: creator.avatarUrl,
          coverImageUrl: creator.coverImageUrl || '',
        });
        setSubscriptionTiers(creator.subscriptionTiers || []);
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
        subscriptionTiers,
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

  const addTier = () => {
    setSubscriptionTiers([
      ...subscriptionTiers,
      {
        id: `tier-${Date.now()}`,
        name: '',
        description: '',
        priceUSDC: 5,
        benefits: [],
      },
    ]);
  };

  const removeTier = (index: number) => {
    setSubscriptionTiers(subscriptionTiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: any) => {
    const updated = [...subscriptionTiers];
    updated[index] = { ...updated[index], [field]: value };
    setSubscriptionTiers(updated);
  };

  const addBenefit = (tierIndex: number) => {
    const updated = [...subscriptionTiers];
    updated[tierIndex].benefits = [...(updated[tierIndex].benefits || []), ''];
    setSubscriptionTiers(updated);
  };

  const updateBenefit = (tierIndex: number, benefitIndex: number, value: string) => {
    const updated = [...subscriptionTiers];
    updated[tierIndex].benefits[benefitIndex] = value;
    setSubscriptionTiers(updated);
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const updated = [...subscriptionTiers];
    updated[tierIndex].benefits = updated[tierIndex].benefits.filter((_: any, i: number) => i !== benefitIndex);
    setSubscriptionTiers(updated);
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

          {/* Subscription Tiers */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Subscription Tiers</h2>
              <button onClick={addTier} className="btn btn-primary btn-sm flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Tier</span>
              </button>
            </div>

            {subscriptionTiers.length === 0 ? (
              <p className="text-gray-600">
                No subscription tiers yet. Add tiers to allow fans to subscribe monthly.
              </p>
            ) : (
              <div className="space-y-6">
                {subscriptionTiers.map((tier, index) => (
                  <div key={tier.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold">Tier {index + 1}</h3>
                      <button
                        onClick={() => removeTier(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Tier Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Bronze"
                            value={tier.name}
                            onChange={(e) => updateTier(index, 'name', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Price (USDC/month)</label>
                          <input
                            type="number"
                            placeholder="5"
                            value={tier.priceUSDC}
                            onChange={(e) =>
                              updateTier(index, 'priceUSDC', parseFloat(e.target.value))
                            }
                            className="input"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label">Description</label>
                        <textarea
                          placeholder="Describe this tier..."
                          value={tier.description}
                          onChange={(e) => updateTier(index, 'description', e.target.value)}
                          className="input resize-none"
                          rows={2}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="label mb-0">Benefits</label>
                          <button
                            onClick={() => addBenefit(index)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            + Add Benefit
                          </button>
                        </div>
                        <div className="space-y-2">
                          {tier.benefits?.map((benefit: string, benefitIndex: number) => (
                            <div key={benefitIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="e.g., Early access to content"
                                value={benefit}
                                onChange={(e) =>
                                  updateBenefit(index, benefitIndex, e.target.value)
                                }
                                className="input"
                              />
                              <button
                                onClick={() => removeBenefit(index, benefitIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        <button
          onClick={() => setIsEditingProfile(true)}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <Settings className="h-5 w-5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
              <p className="text-3xl font-bold text-primary-600">
                {dashboardData.stats.totalSubscribers}
              </p>
            </div>
            <Users className="h-12 w-12 text-primary-600 opacity-20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-primary-600">
                ${dashboardData.stats.monthlyRecurringRevenue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-primary-600 opacity-20" />
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

      {/* Active Subscriptions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Active Subscriptions</h2>
        {dashboardData.activeSubscriptions.length === 0 ? (
          <p className="text-gray-600">No active subscriptions yet</p>
        ) : (
          <div className="space-y-4">
            {dashboardData.activeSubscriptions.map((sub) => (
              <div
                key={sub.fanWallet}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{sub.tierName}</p>
                  <p className="text-sm text-gray-600">
                    Fan: {sub.fanWallet.slice(0, 8)}...{sub.fanWallet.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    ${sub.priceUSDC.toFixed(2)}/mo
                  </p>
                  <p className="text-sm text-gray-500">
                    Next: {new Date(sub.nextPaymentDate).toLocaleDateString()}
                  </p>
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

