
import React, { useRef, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileInputFileProps {
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

const ProfileInputFile = forwardRef<HTMLInputElement, ProfileInputFileProps>(({ 
  onUploadStart, 
  onUploadEnd 
}, ref) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      console.warn('[ProfileInputFile] No file selected or user not authenticated');
      return;
    }
    
    const file = event.target.files[0];
    console.info('[ProfileInputFile] Starting file upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[ProfileInputFile] Invalid file type:', file.type);
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[ProfileInputFile] File too large:', file.size);
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    onUploadStart();
    
    try {
      console.info('[ProfileInputFile] Uploading file to storage:', fileName);
      
      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('[ProfileInputFile] Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.info('[ProfileInputFile] File uploaded successfully, getting public URL');
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      
      if (!urlData.publicUrl) {
        console.error('[ProfileInputFile] Failed to get public URL');
        throw new Error('Failed to get public URL');
      }
      
      console.info('[ProfileInputFile] Got public URL, updating profile:', urlData.publicUrl);
      
      // Update the user profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('[ProfileInputFile] Profile update error:', updateError);
        throw updateError;
      }
      
      console.info('[ProfileInputFile] Profile updated successfully');
      
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated successfully",
      });
      
      // Force a reload to see the new profile picture
      window.location.reload();
    } catch (error: any) {
      console.error('[ProfileInputFile] Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      onUploadEnd();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    console.info('[ProfileInputFile] Triggering file input');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('[ProfileInputFile] File input ref not available');
    }
  };
  
  return (
    <input 
      type="file" 
      ref={(element) => {
        fileInputRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }}
      onChange={handleFileChange} 
      accept="image/*,image/heic,image/heif"
      className="hidden" 
    />
  );
});

export default ProfileInputFile;
