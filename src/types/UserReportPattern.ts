
export interface UserReportPattern {
  pattern: string;
  confidence: number;
  frequency: number;
  lastReported: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

export const convertStringArrayToUserReportPatterns = (patterns: string[]): UserReportPattern[] => {
  return patterns.map(pattern => ({
    pattern,
    confidence: 0.7,
    frequency: 1,
    lastReported: new Date(),
    riskLevel: 'medium' as const
  }));
};
