import { FC, useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { creatorAPI } from '../utils/api';
import CreatorCard from '../components/CreatorCard';

interface Creator {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  walletAddress: string;
  subscriptionTiers: any[];
  totalSubscribers: number;
  totalTipsReceived: number;
}

const ExplorePage: FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = creators.filter(
        (creator) =>
          creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  }, [searchQuery, creators]);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const response = await creatorAPI.getAll();
      setCreators(response.data);
      setFilteredCreators(response.data);
    } catch (error) {
      console.error('Error loading creators:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Creators</h1>
        <p className="text-xl text-gray-600">
          Discover and support amazing creators on Sosiol
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>
      </div>

      {/* Creators Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">
            {searchQuery ? 'No creators found matching your search' : 'No creators yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator._id} {...creator} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;

