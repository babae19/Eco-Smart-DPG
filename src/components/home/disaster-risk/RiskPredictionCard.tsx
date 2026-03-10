
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Target, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskPredictionCardProps {
  type: string;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  score: number;
  confidence: number;
  timeframe: string;
  triggers: string[];
  actions: string[];
  icon: string;
  index: number;
}

const LEVEL_STYLES = {
  critical: 'border-red-500/40 bg-red-500/5',
  high: 'border-orange-500/40 bg-orange-500/5',
  moderate: 'border-yellow-500/40 bg-yellow-500/5',
  low: 'border-success/40 bg-success/5',
};

const LEVEL_BADGE = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  moderate: 'bg-yellow-500 text-white',
  low: 'bg-success text-white',
};

const SCORE_BAR = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  moderate: 'bg-yellow-500',
  low: 'bg-success',
};

const RiskPredictionCard: React.FC<RiskPredictionCardProps> = ({
  type, riskLevel, score, confidence, timeframe, triggers, actions, icon, index,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn('border rounded-xl p-3 cursor-pointer transition-all', LEVEL_STYLES[riskLevel])}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold capitalize truncate">{type}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase', LEVEL_BADGE[riskLevel])}>
                {riskLevel}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />{timeframe}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <span className="text-lg font-bold">{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', SCORE_BAR[riskLevel])}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
        />
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {/* Triggers */}
              <div>
                <h5 className="text-xs font-semibold flex items-center gap-1 mb-1.5 text-muted-foreground">
                  <Target className="h-3 w-3" /> Triggering Factors
                </h5>
                <ul className="space-y-1">
                  {triggers.map((t, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div>
                <h5 className="text-xs font-semibold flex items-center gap-1 mb-1.5 text-muted-foreground">
                  <Shield className="h-3 w-3" /> Recommended Actions
                </h5>
                <ul className="space-y-1">
                  {actions.map((a, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-success mt-0.5">✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                <span className="text-[10px] text-muted-foreground">AI Confidence</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${confidence * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-medium">{(confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RiskPredictionCard;
