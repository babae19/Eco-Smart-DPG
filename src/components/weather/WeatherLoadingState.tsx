
import React from 'react';

const WeatherLoadingState: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="animate-pulse flex flex-col items-center p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default WeatherLoadingState;
