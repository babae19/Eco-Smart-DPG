
import React, { useMemo, useRef } from 'react';
import { Sun, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWeatherData } from '@/hooks/useWeatherData';

const UVIndexAlert: React.FC = () => {
  const { weatherData, isLoading, error } = useWeatherData();

  // Throttle console logs to avoid spam
  const loggedNotShownRef = useRef<string | null>(null);
  const lastShownRef = useRef<number | null>(null);

  const uvAlertData = useMemo(() => {
    if (isLoading || error || !weatherData?.current?.uvIndex) {
      return null;
    }

    const uvIndex = weatherData.current.uvIndex;
    
    if (uvIndex <= 2) return null; // No alert needed for low UV

    let severity: 'low' | 'medium' | 'high';
    let message: string;
    let recommendations: string[];

    if (uvIndex >= 11) {
      severity = 'high';
      message = 'Extreme UV levels detected';
      recommendations = [
        'Avoid outdoor activities between 10 AM - 4 PM',
        'Use SPF 30+ sunscreen and reapply every 2 hours',
        'Wear protective clothing and wide-brimmed hat',
        'Seek shade whenever possible'
      ];
    } else if (uvIndex >= 8) {
      severity = 'high';
      message = 'Very high UV levels';
      recommendations = [
        'Limit outdoor exposure during peak hours',
        'Use SPF 30+ sunscreen',
        'Wear protective clothing and sunglasses'
      ];
    } else if (uvIndex >= 6) {
      severity = 'medium';
      message = 'High UV levels';
      recommendations = [
        'Use SPF 15+ sunscreen',
        'Wear sunglasses and protective clothing'
      ];
    } else {
      severity = 'low';
      message = 'Moderate UV levels';
      recommendations = ['Consider sunscreen for extended outdoor activities'];
    }

    return { severity, message, recommendations, uvIndex };
  }, [weatherData, isLoading, error]);

  // Don't render if loading, error, or no UV data
  if (!uvAlertData) {
    const stateKey = `${isLoading}-${!!error}-${!!weatherData?.current?.uvIndex}`;
    if (loggedNotShownRef.current !== stateKey) {
      console.debug('[UVIndexAlert] Not showing (loading/error/no UV data)', {
        isLoading,
        error: !!error,
        hasData: !!weatherData?.current?.uvIndex
      });
      loggedNotShownRef.current = stateKey;
    }
    return null;
  }

  if (lastShownRef.current !== uvAlertData.uvIndex) {
    console.debug('[UVIndexAlert] Showing UV alert', {
      uvIndex: uvAlertData.uvIndex,
      severity: uvAlertData.severity
    });
    lastShownRef.current = uvAlertData.uvIndex;
  }

  const getAlertVariant = () => {
    switch (uvAlertData.severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'default';
    }
  };

  const getUVColor = () => {
    if (uvAlertData.uvIndex >= 11) return 'text-purple-600';
    if (uvAlertData.uvIndex >= 8) return 'text-red-600';
    if (uvAlertData.uvIndex >= 6) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      <Sun className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{uvAlertData.message}</span>
          <Badge variant="outline" className={getUVColor()}>
            UV {uvAlertData.uvIndex.toFixed(1)}
          </Badge>
        </div>
        <ul className="text-sm space-y-1">
          {uvAlertData.recommendations.map((rec, index) => (
            <li key={index}>• {rec}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default UVIndexAlert;
