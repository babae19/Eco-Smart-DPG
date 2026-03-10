
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReportHeaderProps {
  title: string;
  issueType: string;
  status: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  title, 
  issueType,
  status 
}) => {
  const getIssueTypeBadge = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case 'illegal dumping': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Illegal Dumping</Badge>;
      case 'deforestation': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Deforestation</Badge>;
      case 'water pollution': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Water Pollution</Badge>;
      case 'air pollution': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Air Pollution</Badge>;
      case 'wildlife endangerment': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Wildlife Endangerment</Badge>;
      default: return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{issueType}</Badge>;
    }
  };

  return (
    <>
      <div className="mb-2">
        {getIssueTypeBadge(issueType)}
      </div>
      <h3 className="font-bold text-xl text-gray-800 mb-2">{title}</h3>
    </>
  );
};
