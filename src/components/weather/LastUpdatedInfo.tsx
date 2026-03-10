
import React from 'react';

interface LastUpdatedInfoProps {
  lastUpdated: Date;
}

const LastUpdatedInfo: React.FC<LastUpdatedInfoProps> = ({ lastUpdated }) => {
  return (
    <p className="text-xs text-gray-500 mt-2 italic text-center">
      Last updated: {lastUpdated.toLocaleTimeString()}
    </p>
  );
};

export default LastUpdatedInfo;
