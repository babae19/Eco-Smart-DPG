
import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

interface ReportMetadataProps {
  location: string;
  date: string;
}

export const ReportMetadata: React.FC<ReportMetadataProps> = ({ location, date }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
      <div className="flex items-center">
        <MapPin size={14} className="mr-1 text-gray-400" />
        <span>{location}</span>
      </div>
      <div className="flex items-center">
        <Calendar size={14} className="mr-1 text-gray-400" />
        <span>{formatDate(date)}</span>
      </div>
      <div className="flex items-center">
        <Clock size={14} className="mr-1 text-gray-400" />
        <span>{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
