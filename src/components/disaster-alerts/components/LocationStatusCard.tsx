
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin, Loader2, Smartphone } from 'lucide-react';

interface LocationStatusCardProps {
  hasLocation: boolean;
  locationError: string | null;
  accuracy: number | null;
  isMobile: boolean;
  hyperLocalAlerts: any[];
  isAnalyzing: boolean;
  children?: React.ReactNode;
}

const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  hasLocation,
  locationError,
  accuracy,
  isMobile,
  hyperLocalAlerts,
  isAnalyzing,
  children
}) => {
  const getStatusColor = () => {
    if (locationError) return 'border-red-200 bg-red-50';
    if (!hasLocation) return 'border-amber-200 bg-amber-50';
    if (hasLocation && accuracy && accuracy <= 50) return 'border-green-200 bg-green-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getStatusIcon = () => {
    if (locationError) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (!hasLocation) return <MapPin className="h-4 w-4 text-amber-600" />;
    if (hasLocation) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
  };

  return (
    <Card className={`${getStatusColor()} transition-colors duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Mobile Location Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                📱 Mobile Device
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {hasLocation ? 'Active' : 'Searching...'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default LocationStatusCard;
