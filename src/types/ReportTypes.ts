
export interface ReportRiskFactor {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string;
}

export interface UserReportPattern {
  id: string;
  reportType: string;
  frequency: number;
  lastReported: Date;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
}
