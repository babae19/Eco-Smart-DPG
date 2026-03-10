
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCampaign } from '@/services/campaigns';
import { Campaign, CampaignGoal } from '@/models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Calendar, Camera } from 'lucide-react';

interface CampaignFormProps {
  onCampaignCreated: (campaign: Campaign) => void;
  onCancel: () => void;
}

const campaignGoalOptions: CampaignGoal[] = [
  'Raise Awareness',
  'Fundraising',
  'Community Engagement',
  'Educational Campaign',
  'Environmental Action'
];

const CampaignForm: React.FC<CampaignFormProps> = ({ onCampaignCreated, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<CampaignGoal>('Raise Awareness');
  const [endDate, setEndDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Please select an image smaller than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/campaigns/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) throw new Error('Failed to get public URL');
    
    return urlData.publicUrl;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageToStorage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a campaign",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !description.trim() || !endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate end date is in the future
    const selectedDate = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      toast({
        title: "Invalid date",
        description: "End date must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const campaignData = {
        title: title.trim(),
        description: description.trim(),
        goal: goal,
        endDate: selectedDate,
        images: images.length > 0 ? images : undefined
      };

      const newCampaign = await createCampaign(campaignData);
      
      if (newCampaign) {
        onCampaignCreated(newCampaign);
        toast({
          title: "Campaign created",
          description: "Your campaign is now live and visible to everyone!",
        });
        
        // Reset form
        setTitle('');
        setDescription('');
        setGoal('Raise Awareness');
        setEndDate('');
        setImages([]);
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Start a New Campaign</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={18} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Title*
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter campaign title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
            placeholder="Describe your campaign goals and impact"
            required
          />
        </div>
        
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Goal*
          </label>
          <select
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as CampaignGoal)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            {campaignGoalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date*
          </label>
          <div className="relative">
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Images (Optional - Max 5)
          </label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Campaign image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 shadow-lg transition-colors"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {images.length < 5 && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="py-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-50 transition-colors bg-card"
              >
                <Camera size={24} className="mb-2" />
                <span className="text-sm font-medium">Take Photo</span>
              </button>
              
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={isUploading}
                className="py-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-50 transition-colors bg-card"
              >
                <Upload size={24} className="mb-2" />
                <span className="text-sm font-medium">Upload Files</span>
              </button>
            </div>
          )}
          
          {isUploading && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Uploading images...
            </p>
          )}
          
          {images.length >= 5 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Maximum of 5 images reached
            </p>
          )}
          
          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            multiple
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            multiple
            className="hidden"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
