
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, RefreshCw, MapPin, Thermometer, Droplets, Wind, 
  Users, TrendingUp, TrendingDown, Minus, AlertTriangle,
  ChevronRight, Loader2, WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDisasterRiskAnalysis } from './useDisasterRiskAnalysis';
import RiskScoreGauge from './RiskScoreGauge';
import RiskPredictionCard from './RiskPredictionCard';

const TREND_ICON = {
  increasing: <TrendingUp className="h-3 w-3 text-red-500" />,
  decreasing: <TrendingDown className="h-3 w-3 text-success" />,
  stable: <Minus className="h-3 w-3 text-muted-foreground" />,
};

const DisasterRiskAnalysis: React.FC = () => {
  const { data, isLoading, error, progress, refresh } = useDisasterRiskAnalysis();
  const [showAllPredictions, setShowAllPredictions] = useState(false);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-bold text-sm">AI Disaster Risk Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Analyzing your location...</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center py-6">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-medium">Processing risk data</p>
                <div className="w-48 h-1.5 bg-muted/30 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {progress < 20 ? 'Locating disaster zones...' :
                   progress < 40 ? 'Fetching real-time weather...' :
                   progress < 60 ? 'Scanning community reports...' :
                   progress < 80 ? 'Running AI prediction models...' :
                   'Finalizing risk assessment...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No location / error
  if (!data && !isLoading) {
    return (
      <div className="rounded-2xl border border-muted/30 bg-card overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-bold text-sm">AI Disaster Risk Analysis</h3>
            <p className="text-xs text-muted-foreground">
              {error || 'Enable location to analyze disaster risks in your area'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const visiblePredictions = showAllPredictions ? data.predictions : data.predictions.slice(0, 3);
  const topConfidence = data.predictions[0]?.confidence || 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary/20 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Disaster Risk Analysis</h3>
              <p className="text-[10px] text-muted-foreground">
                Real-time • Weather • Historical • Community
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4 text-muted-foreground', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Overall Risk Gauge + Weather Summary */}
      <div className="p-4 flex items-start gap-4">
        <RiskScoreGauge
          score={data.overallScore}
          level={data.overallRisk}
          confidence={topConfidence}
        />
        
        {/* Right side: weather + zones */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Live weather strip */}
          {data.weather && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Thermometer className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                <span className="truncate">{data.weather.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Droplets className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{data.weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Wind className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
                <span className="truncate">{data.weather.windSpeed.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Droplets className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{data.weather.precipitation.toFixed(1)}mm</span>
              </div>
            </div>
          )}

          {/* Nearby zones */}
          {data.nearbyZones.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium mb-1 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" /> Nearest Risk Zones
              </p>
              <div className="space-y-1">
                {data.nearbyZones.slice(0, 2).map((zone, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate text-foreground/80">{zone.name}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                      {zone.distance.toFixed(1)}km
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community reports */}
          {data.communityReports.total > 0 && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30">
              <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{data.communityReports.total}</span>
                <span className="text-muted-foreground"> reports (7d)</span>
              </div>
              <div className="flex items-center gap-0.5">
                {TREND_ICON[data.communityReports.trend]}
                <span className="text-[10px] capitalize">{data.communityReports.trend}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Predictions */}
      {data.predictions.length > 0 ? (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              Risk Predictions ({data.predictions.length})
            </h4>
          </div>

          <div className="space-y-2">
            {visiblePredictions.map((pred, idx) => (
              <RiskPredictionCard key={pred.type} {...pred} index={idx} />
            ))}
          </div>

          {data.predictions.length > 3 && (
            <button
              onClick={() => setShowAllPredictions(!showAllPredictions)}
              className="w-full flex items-center justify-center gap-1 text-xs text-primary font-medium py-2 hover:bg-primary/5 rounded-lg transition-colors"
            >
              {showAllPredictions ? 'Show Less' : `View All ${data.predictions.length} Predictions`}
              <ChevronRight className={cn('h-3 w-3 transition-transform', showAllPredictions && 'rotate-90')} />
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="text-center py-4 bg-success/5 rounded-xl border border-success/20">
            <span className="text-2xl">✅</span>
            <p className="text-sm font-medium mt-1 text-success">No Significant Risks Detected</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Conditions are safe in your area</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-muted/20 pt-2">
          <span>
            Powered by AI • {data.nearbyZones.length} zones • {data.predictions.length} risks analyzed
          </span>
          {data.lastUpdated && (
            <span>
              {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DisasterRiskAnalysis;
