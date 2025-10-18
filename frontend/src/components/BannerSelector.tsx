import { FC, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { bannerPatterns, BannerPattern, getBannerPatternsByCategory } from '../data/bannerPatterns';

interface BannerSelectorProps {
  currentBannerUrl?: string;
  onBannerChange: (bannerUrl: string) => void;
  disabled?: boolean;
}

const BannerSelector: FC<BannerSelectorProps> = ({ 
  currentBannerUrl, 
  onBannerChange, 
  disabled = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BannerPattern['category']>('gradient');
  const [selectedBanner, setSelectedBanner] = useState<string | null>(currentBannerUrl || null);

  const categories: { key: BannerPattern['category']; label: string }[] = [
    { key: 'gradient', label: 'Gradients' },
    { key: 'geometric', label: 'Geometric' },
    { key: 'abstract', label: 'Abstract' },
    { key: 'nature', label: 'Nature' },
    { key: 'tech', label: 'Tech' }
  ];

  const handleBannerSelect = (banner: BannerPattern) => {
    if (disabled) return;
    
    setSelectedBanner(banner.url);
    onBannerChange(banner.url);
  };

  const currentPatterns = getBannerPatternsByCategory(selectedCategory);

  return (
    <div className="space-y-4">
      <label className="label">Banner Image</label>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            disabled={disabled}
            className={`
              px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === category.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentPatterns.map((banner) => (
          <div
            key={banner.id}
            className={`
              relative aspect-video rounded-lg overflow-hidden cursor-pointer
              border-2 transition-all hover:scale-105
              ${selectedBanner === banner.url
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => handleBannerSelect(banner)}
          >
            <img
              src={banner.url}
              alt={banner.name}
              className="w-full h-full object-cover"
            />
            
            {/* Selection Indicator */}
            {selectedBanner === banner.url && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* Banner Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-xs font-medium truncate">
                {banner.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Selection Info */}
      {selectedBanner && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <Palette className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-sm font-medium">Selected Banner</p>
            <p className="text-xs text-gray-600">
              {bannerPatterns.find(p => p.url === selectedBanner)?.name}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-500">
        <p>• Choose from our curated collection of banner patterns</p>
        <p>• Click on any banner to select it</p>
        <p>• Use the category tabs to browse different styles</p>
      </div>
    </div>
  );
};

export default BannerSelector;
