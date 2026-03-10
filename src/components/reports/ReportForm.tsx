import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReportFormFields from './ReportFormFields';
import ImageUploadSection from './ImageUploadSection';
import { useReportSubmission } from '@/hooks/useReportSubmission';

const ReportForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const { isSubmitting, handleSubmit } = useReportSubmission();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit({
      title,
      description,
      location,
      issueType,
      images
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ReportFormFields
        issueType={issueType}
        setIssueType={setIssueType}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
      />
      
      <ImageUploadSection
        images={images}
        setImages={setImages}
      />
      
      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </Button>
    </form>
  );
};

export default ReportForm;