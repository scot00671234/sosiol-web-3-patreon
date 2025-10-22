import { FC } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

interface CreatorCardProps {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  totalTipsReceived: number;
}

const CreatorCard: FC<CreatorCardProps> = ({
  username,
  displayName,
  bio,
  avatarUrl,
  totalTipsReceived,
}) => {

  return (
    <Link to={`/creator/${username}`} className="block">
      <div className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500 mb-2">@{username}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{bio}</p>

            {/* Stats */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1 text-sm text-primary-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>${totalTipsReceived.toFixed(2)} received</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;

