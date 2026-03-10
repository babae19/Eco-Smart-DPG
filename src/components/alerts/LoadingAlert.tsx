
import React from 'react';

const LoadingAlert: React.FC = () => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
};

export default LoadingAlert;
