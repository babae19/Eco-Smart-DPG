
import React from 'react';
import { cn } from '@/lib/utils';

interface RiskFactorBadgeProps {
  factor: string;
  className?: string;
}

const RiskFactorBadge: React.FC<RiskFactorBadgeProps> = ({ factor, className }) => {
  const getBadgeColor = (factor: string) => {
    const lowerFactor = factor.toLowerCase();
    if (lowerFactor.includes('rain') || lowerFactor.includes('humid') || lowerFactor.includes('water')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    } else if (lowerFactor.includes('temp') || lowerFactor.includes('heat')) {
      return 'bg-orange-50 text-orange-700 border-orange-100';
    } else if (lowerFactor.includes('wind')) {
      return 'bg-slate-50 text-slate-700 border-slate-100';
    } else if (lowerFactor.includes('histor')) {
      return 'bg-purple-50 text-purple-700 border-purple-100';
    }
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <span 
      className={cn(
        "px-2 py-1 rounded-full text-xs border",
        getBadgeColor(factor),
        className
      )}
    >
      {factor}
    </span>
  );
};

export default RiskFactorBadge;
