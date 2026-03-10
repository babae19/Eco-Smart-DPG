
import React from 'react';
import { motion } from 'framer-motion';

interface RiskScoreGaugeProps {
  score: number;
  level: 'critical' | 'high' | 'moderate' | 'low';
  confidence: number;
}

const LEVEL_CONFIG = {
  critical: { color: 'hsl(0, 84%, 60%)', bg: 'bg-red-500/10', text: 'text-red-600', label: 'CRITICAL' },
  high: { color: 'hsl(25, 95%, 53%)', bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'HIGH' },
  moderate: { color: 'hsl(45, 93%, 47%)', bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'MODERATE' },
  low: { color: 'hsl(142, 71%, 45%)', bg: 'bg-success/10', text: 'text-success', label: 'LOW' },
};

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, level, confidence }) => {
  const config = LEVEL_CONFIG[level];
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted/30" />
          {/* Progress arc */}
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            strokeWidth="8"
            stroke={config.color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color: config.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <motion.div
        className={`mt-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider ${config.bg} ${config.text}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {config.label} RISK
      </motion.div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        AI Confidence: {(confidence * 100).toFixed(0)}%
      </p>
    </div>
  );
};

export default RiskScoreGauge;
