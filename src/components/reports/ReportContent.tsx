
import React from 'react';

interface ReportContentProps {
  description: string;
}

export const ReportContent: React.FC<ReportContentProps> = ({ description }) => {
  return (
    <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
  );
};
