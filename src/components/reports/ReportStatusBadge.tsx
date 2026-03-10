
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReportStatusBadgeProps {
  status: string;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status }) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending': return "bg-warning/10 text-warning-foreground border-warning/20";
      case 'reviewing': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'resolved': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge className={getStatusColors(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
