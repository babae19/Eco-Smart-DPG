
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';

export interface AlertCardProps {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  location: string;
  isPersonalized?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ 
  id, 
  title, 
  description, 
  severity, 
  date,
  location,
  isPersonalized
}) => {
  const navigate = useNavigate();
  
  const severityConfig = {
    high: {
      gradient: 'from-destructive/10 to-destructive/5',
      border: 'border-destructive/30',
      iconBg: 'bg-destructive/10',
      text: 'text-destructive',
      icon: <AlertTriangle className="text-destructive" size={18} />,
      badge: 'bg-destructive text-destructive-foreground',
    },
    medium: {
      gradient: 'from-warning/10 to-warning/5',
      border: 'border-warning/30',
      iconBg: 'bg-warning/10',
      text: 'text-warning',
      icon: <AlertTriangle className="text-warning" size={18} />,
      badge: 'bg-warning text-warning-foreground',
    },
    low: {
      gradient: 'from-info/10 to-info/5',
      border: 'border-info/30',
      iconBg: 'bg-info/10',
      text: 'text-info',
      icon: <Info className="text-info" size={18} />,
      badge: 'bg-info text-info-foreground',
    }
  };
  
  const config = severityConfig[severity];
  
  return (
    <div 
      className={`group bg-gradient-to-br ${config.gradient} border ${config.border} rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isPersonalized ? 'ring-2 ring-success/40' : ''}`}
      onClick={() => navigate(`/disaster/${id}`)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold ${config.text} text-base leading-tight`}>
              {title}
            </h3>
            <ArrowRight 
              size={18} 
              className="flex-shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform" 
            />
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md ${config.badge} font-medium uppercase tracking-wide`}>
              {severity}
            </span>
            {isPersonalized && (
              <span className="px-2 py-0.5 rounded-md bg-success/10 text-success font-medium border border-success/20">
                For You
              </span>
            )}
            <span className="text-muted-foreground">{date}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
