import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadSectionProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  setImages
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Please select an image smaller than 10MB');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/reports/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log('Uploading file to:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(uploadError.message);
    }
    
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    return urlData.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload images",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    console.log('Processing files:', files.length);
    
    try {
      const uploadPromises = Array.from(files).map(file => {
        console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
        return uploadImageToStorage(file);
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      console.log('Files uploaded successfully:', imageUrls.length);
      
      setImages(prev => {
        const newImages = [...prev, ...imageUrls];
        console.log('Total images now:', newImages.length);
        return newImages;
      });
      
      toast({
        title: "Images uploaded",
        description: `${imageUrls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
    
    // Clear input values
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCameraCapture = () => {
    console.log('Camera capture triggered');
    if (cameraInputRef.current) {
      console.log('Clicking camera input');
      cameraInputRef.current.click();
    } else {
      console.error('Camera input ref not available');
    }
  };
  
  const handleFileUpload = () => {
    console.log('File upload triggered');
    if (fileInputRef.current) {
      console.log('Clicking file input');
      fileInputRef.current.click();
    } else {
      console.error('File input ref not available');
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('Removing image at index:', index);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">
        Images (Optional)
      </p>
      
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <X size={14} className="text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCameraCapture}
          disabled={isUploading}
          className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Camera size={20} className="mr-2" />}
          <span>{isUploading ? 'Uploading...' : 'Take Photo'}</span>
        </button>
        
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={isUploading}
          className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Upload size={20} className="mr-2" />}
          <span>{isUploading ? 'Uploading...' : 'Choose Files'}</span>
        </button>
      </div>
      
      {/* Mobile-optimized file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic,image/heif"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploadSection;