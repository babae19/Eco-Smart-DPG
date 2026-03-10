
import React from 'react';
import { User, Upload, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  avatarUrl?: string;
  fullName?: string;
  email?: string;
  uploading: boolean;
  onAvatarClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  fullName,
  email,
  uploading,
  onAvatarClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center">
        <div className="relative">
          <button 
            onClick={onAvatarClick}
            disabled={uploading}
            className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User avatar profile photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={30} className="text-gray-500" />
            )}
            
            {uploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload size={20} className="text-white" />
              </div>
            )}
          </button>
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
            <Award size={16} />
          </div>
        </div>
        
        <div className="ml-4">
          <h2 className="text-xl font-semibold">{fullName || 'Eco Warrior'}</h2>
          <p className="text-gray-600 text-sm">{email || 'example@email.com'}</p>
          <div className="flex items-center mt-1">
            <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Climate Champion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
