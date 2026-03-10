
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TipCardProps {
  title: string;
  description: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
}

const TipCard: React.FC<TipCardProps> = ({ 
  title, 
  description, 
  category,
  impact
}) => {
  const impactConfig = {
    high: {
      label: 'High Impact',
      color: 'bg-green-100 text-green-800'
    },
    medium: {
      label: 'Medium Impact',
      color: 'bg-blue-100 text-blue-800'
    },
    low: {
      label: 'Low Impact',
      color: 'bg-gray-100 text-gray-800'
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-1 bg-amber-100 p-2 rounded-full">
            <Lightbulb className="text-amber-500" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            
            <div className="flex items-center mt-3">
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                {category}
              </span>
              <span className={`text-xs ml-2 px-2 py-1 rounded-full ${impactConfig[impact].color}`}>
                {impactConfig[impact].label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipCard;
