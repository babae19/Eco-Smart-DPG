
import React from 'react';
import { Report } from '@/services/reports/reportTypes';
import { Card } from '@/components/ui/card';
import RecentReportItem from './RecentReportItem';

interface RecentReportsListProps {
  reports: Report[];
}

const RecentReportsList: React.FC<RecentReportsListProps> = ({ reports }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {reports.map((report, index) => (
        <Card key={report.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
          <RecentReportItem 
            report={report} 
            index={index} 
          />
        </Card>
      ))}
    </div>
  );
};

export default RecentReportsList;
