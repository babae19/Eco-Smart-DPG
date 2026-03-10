
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle } from 'lucide-react';

interface SafetyRecommendationsProps {
  recommendations: string[];
}

const SafetyRecommendations: React.FC<SafetyRecommendationsProps> = ({ recommendations }) => {
  if (!recommendations.length) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Shield className="h-4 w-4 mr-2 text-green-600" />
        Safety Recommendations:
      </h3>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md p-4 shadow-sm">
        <ul className="space-y-3">
          {recommendations.slice(0, 3).map((recommendation, index) => (
            <li key={index} className="flex items-start animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 mt-0.5">
                <CheckCircle className="h-3 w-3" />
              </div>
              <div>
                <span className="text-sm text-green-800">{recommendation}</span>
              </div>
            </li>
          ))}
          
          {recommendations.length > 3 && (
            <li className="text-xs text-green-700 pl-7 italic">
              +{recommendations.length - 3} more recommendations
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SafetyRecommendations;
