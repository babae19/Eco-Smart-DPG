import React from 'react';
import { MapPin } from 'lucide-react';
import { issueTypes } from '@/utils/fileProcessingUtils';
import { useUserLocation } from '@/contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

interface ReportFormFieldsProps {
  issueType: string;
  setIssueType: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
}

const ReportFormFields: React.FC<ReportFormFieldsProps> = ({
  issueType,
  setIssueType,
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation
}) => {
  const { latitude, longitude } = useUserLocation();

  const handleGetLocation = () => {
    const locationText = latitude && longitude ? 'Freetown, Sierra Leone' : 'San Francisco, CA';
    setLocation(locationText);
    
    toast({
      title: "Location detected",
      description: `Current location: ${locationText}`,
    });
  };

  return (
    <>
      <div>
        <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
          Issue Type*
        </label>
        <select
          id="issueType"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Select issue type</option>
          {issueTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title*
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Brief title for the issue"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
          placeholder="Describe the environmental issue in detail"
          required
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="flex">
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Where is this issue located?"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 flex items-center justify-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <MapPin size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportFormFields;