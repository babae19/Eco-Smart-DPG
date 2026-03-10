
import React from 'react';
import { AlertTriangle, CloudLightning, Info, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ClimateFactCardProps {
  title: string;
  description: string;
  alertLevel?: 'warning' | 'danger' | 'info';
}

const ClimateFactCard: React.FC<ClimateFactCardProps> = ({
  title,
  description,
  alertLevel = 'info'
}) => {
  const getAlertIcon = () => {
    switch (alertLevel) {
      case 'danger':
        return <AlertTriangle size={18} className="text-white" />;
      case 'warning':
        return <Shield size={18} className="text-white" />;
      default:
        return <Info size={18} className="text-white" />;
    }
  };

  const getGradient = () => {
    switch (alertLevel) {
      case 'danger':
        return 'from-red-500 to-orange-500 shadow-red-200/50';
      case 'warning':
        return 'from-amber-500 to-yellow-500 shadow-amber-200/50';
      default:
        return 'from-indigo-500 to-violet-500 shadow-indigo-200/50';
    }
  };

  const getBackground = () => {
    switch (alertLevel) {
      case 'danger':
        return 'bg-gradient-to-br from-red-50 to-orange-50';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-yellow-50';
      default:
        return 'bg-gradient-to-br from-indigo-50 to-violet-50';
    }
  };

  const getBorder = () => {
    switch (alertLevel) {
      case 'danger':
        return 'border-red-100';
      case 'warning':
        return 'border-amber-100';
      default:
        return 'border-indigo-100';
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1",
        getBackground(),
        getBorder()
      )}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-base font-semibold z-10",
            alertLevel === 'danger' ? 'text-red-800' :
            alertLevel === 'warning' ? 'text-amber-800' :
            'text-indigo-800'
          )}>
            {title}
          </CardTitle>
          <div className={cn(
            "flex items-center px-3 py-1 rounded-full text-white bg-gradient-to-r shadow-md",
            getGradient()
          )}>
            {getAlertIcon()}
            <span className="text-xs font-medium capitalize ml-1">{alertLevel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className={cn(
          "text-sm leading-relaxed",
          alertLevel === 'danger' ? 'text-red-700' :
          alertLevel === 'warning' ? 'text-amber-700' :
          'text-indigo-700'
        )}>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ClimateFactCard;
