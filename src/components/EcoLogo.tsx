
import React from 'react';

interface EcoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const EcoLogo: React.FC<EcoLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showTagline = false 
}) => {
  const sizeClass = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="/uploads/ac08b10c-f8f5-43a1-b46d-a078121154d0.png" 
        alt="EcoSmart Logo" 
        className={`${sizeClass[size]}`}
      />
      {showTagline && (
        <p className="text-indigo-800 text-sm mt-1 font-medium">
          Real-time Climate Change Insights at Your Fingertips
        </p>
      )}
    </div>
  );
};

export default EcoLogo;
