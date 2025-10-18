// Predefined banner patterns for creators to choose from
export interface BannerPattern {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'gradient' | 'geometric' | 'abstract' | 'nature' | 'tech';
}

export const bannerPatterns: BannerPattern[] = [
  // Gradient patterns
  {
    id: 'gradient-1',
    name: 'Ocean Blue',
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=400&fit=crop&crop=center',
    description: 'Calming ocean blue gradient',
    category: 'gradient'
  },
  {
    id: 'gradient-2',
    name: 'Sunset Orange',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=center',
    description: 'Warm sunset orange gradient',
    category: 'gradient'
  },
  {
    id: 'gradient-3',
    name: 'Purple Dream',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=400&fit=crop&crop=center',
    description: 'Mystical purple gradient',
    category: 'gradient'
  },
  {
    id: 'gradient-4',
    name: 'Forest Green',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop&crop=center',
    description: 'Natural forest green gradient',
    category: 'gradient'
  },

  // Geometric patterns
  {
    id: 'geometric-1',
    name: 'Hexagon Grid',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop&crop=center',
    description: 'Modern hexagon pattern',
    category: 'geometric'
  },
  {
    id: 'geometric-2',
    name: 'Circuit Board',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop&crop=center',
    description: 'Tech-inspired circuit pattern',
    category: 'geometric'
  },
  {
    id: 'geometric-3',
    name: 'Minimal Lines',
    url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=400&fit=crop&crop=center',
    description: 'Clean minimal line pattern',
    category: 'geometric'
  },

  // Abstract patterns
  {
    id: 'abstract-1',
    name: 'Cosmic Waves',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=center',
    description: 'Abstract cosmic wave pattern',
    category: 'abstract'
  },
  {
    id: 'abstract-2',
    name: 'Digital Art',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop&crop=center',
    description: 'Modern digital art style',
    category: 'abstract'
  },

  // Nature patterns
  {
    id: 'nature-1',
    name: 'Mountain Range',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=center',
    description: 'Serene mountain landscape',
    category: 'nature'
  },
  {
    id: 'nature-2',
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop&crop=center',
    description: 'Peaceful forest pathway',
    category: 'nature'
  },

  // Tech patterns
  {
    id: 'tech-1',
    name: 'Neon Grid',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop&crop=center',
    description: 'Futuristic neon grid',
    category: 'tech'
  },
  {
    id: 'tech-2',
    name: 'Data Streams',
    url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=400&fit=crop&crop=center',
    description: 'Dynamic data visualization',
    category: 'tech'
  }
];

export const getBannerPatternsByCategory = (category: BannerPattern['category']) => {
  return bannerPatterns.filter(pattern => pattern.category === category);
};

export const getBannerPatternById = (id: string) => {
  return bannerPatterns.find(pattern => pattern.id === id);
};
