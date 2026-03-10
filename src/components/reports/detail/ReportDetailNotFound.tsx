
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ReportDetailNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Report Not Found</h3>
        <p className="text-gray-600 mb-4">The report you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/reports')}>
          View All Reports
        </Button>
      </div>
    </div>
  );
};
