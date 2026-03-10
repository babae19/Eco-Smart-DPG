
import React from 'react';
import { CloudLightning, Sparkles } from 'lucide-react';

const ClimateFactsHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5 rounded-xl shadow-lg mr-3 transform rotate-3">
          <CloudLightning size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent flex items-center">
            Daily Climate Facts
            <Sparkles size={18} className="ml-2 text-amber-500" />
          </h2>
          <p className="text-xs text-indigo-700 font-medium">Understand climate impacts today</p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-violet-100 to-indigo-100 text-xs font-medium text-indigo-800 px-3 py-1.5 rounded-full shadow-sm border border-indigo-200/50 flex items-center">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-2"></span>
        Updated Daily
      </div>
    </div>
  );
};

export default ClimateFactsHeader;
