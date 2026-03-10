
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Users, TrendingUp } from 'lucide-react';

interface UserReportPattern {
  reportType: string;
  frequency: number;
  lastReported: string;
  location: string;
  recentReports: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
}

interface ReportRiskFactor {
  riskType: string;
  confidence: number;
  description: string;
  timeframe: string;
}

interface CommunityReportsTabContentProps {
  userReportPatterns: UserReportPattern[];
  reportRiskFactors: ReportRiskFactor[];
  onRefresh: () => void;
}

const CommunityReportsTabContent: React.FC<CommunityReportsTabContentProps> = ({
  userReportPatterns,
  reportRiskFactors,
  onRefresh
}) => {
  return (
    <TabsContent value="community" className="p-4 space-y-3">
      {userReportPatterns.length === 0 && reportRiskFactors.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No community reports analyzed yet</p>
        </div>
      ) : (
        <>
          {reportRiskFactors.map((factor, index) => (
            <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-amber-900">{factor.riskType}</h4>
                  <p className="text-xs text-amber-700 mt-1">{factor.description}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-amber-600 mr-1" />
                    <span className="text-xs text-amber-600">
                      Confidence: {Math.round(factor.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </TabsContent>
  );
};

export default CommunityReportsTabContent;
