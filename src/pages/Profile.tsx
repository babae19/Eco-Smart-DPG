
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileInputFile from '@/components/profile/ProfileInputFile';
import ActivityHistoryDialog from '@/components/profile/ActivityHistoryDialog';
import BadgesDialog from '@/components/profile/BadgesDialog';
import { useSEO } from '@/hooks/useSEO';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSEO({
    title: 'Profile | Environmental Alerts & Activity',
    description: 'Manage your profile, avatar, and activity history for environmental and disaster alerts.',
    canonicalPath: '/profile',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: 'User Profile',
      description: 'User profile, avatar and activity history.'
    }
  });
  const handleProfilePictureClick = () => {
    // Directly trigger file input instead of showing upload button
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSectionClick = (section: string) => {
    setOpenDialog(section);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 sm:px-6">
      <Header title="My Profile" />
      
      <div className="max-w-lg mx-auto">
        <ProfileContent
          uploading={uploading}
          onAvatarClick={handleProfilePictureClick}
          onSectionClick={handleSectionClick}
        />
        
        {/* Hidden file input for direct upload */}
        <ProfileInputFile
          ref={fileInputRef}
          onUploadStart={() => setUploading(true)}
          onUploadEnd={() => setUploading(false)}
        />
      </div>
      
      <ActivityHistoryDialog 
        isOpen={openDialog === 'activity'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      
      <BadgesDialog 
        isOpen={openDialog === 'badges'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      
      <CustomBottomNavigation />
    </div>
  );
};

export default Profile;
