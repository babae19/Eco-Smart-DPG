import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { addReport } from '@/services/reportService';
import { useUserLocation } from '@/contexts/LocationContext';

export const useReportSubmission = () => {
  const navigate = useNavigate();
  const { latitude, longitude } = useUserLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    location: string;
    issueType: string;
    images: string[];
  }) => {
    const { title, description, location, issueType, images } = formData;
    
    if (!title || !description || !issueType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting report with images:', images.length, 'URLs:', images);
    
    try {
      await addReport({
        title,
        description,
        location: location || (latitude && longitude ? 'Freetown, Sierra Leone' : 'Unknown location'),
        issueType,
        images
      });
      
      toast({
        title: "Success",
        description: "Your report has been submitted successfully",
      });
      
      navigate('/reports-feed');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};