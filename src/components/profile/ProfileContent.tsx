
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import ImpactStats from './ImpactStats';
import NavigationButtons from './NavigationButtons';
import ProfileLogoutButton from './ProfileLogoutButton';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';

interface ProfileContentProps {
  uploading: boolean;
  onAvatarClick: () => void;
  onSectionClick: (section: string) => void;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  uploading,
  onAvatarClick,
  onSectionClick,
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { stats, loading } = useUserStats();
  
  const handleNavigateSettings = () => {
    navigate('/settings');
  };
  
  return (
    <div className="space-y-4">
      <ProfileHeader 
        avatarUrl={profile?.avatar_url}
        fullName={profile?.full_name}
        email={user?.email}
        uploading={uploading}
        onAvatarClick={onAvatarClick}
      />
      
      <ImpactStats 
        stats={stats}
        loading={loading}
      />
      
      <NavigationButtons 
        onSectionClick={onSectionClick}
        onSettingsClick={handleNavigateSettings}
      />
      
      <ProfileLogoutButton />
    </div>
  );
};

export default ProfileContent;
