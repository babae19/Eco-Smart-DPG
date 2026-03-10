
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageSquare, Clock, Camera, AlertTriangle, Leaf, Droplets, Wind, TreePine, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Report } from '@/services/reports/reportTypes';
import { motion } from 'framer-motion';

interface RecentReportItemProps {
  report: Report;
  index: number;
}

const RecentReportItem: React.FC<RecentReportItemProps> = ({ report, index }) => {
  const navigate = useNavigate();
  
  const handleReportClick = () => {
    navigate(`/report/${report.id}`);
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return { variant: 'secondary' as const, className: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' };
      case 'approved': return { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'rejected': return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
      default: return { variant: 'outline' as const, className: 'bg-muted text-muted-foreground' };
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffMs = now.getTime() - reportDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return reportDate.toLocaleDateString();
  };
  
  const getIssueTypeConfig = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case 'illegal dumping': 
        return { 
          icon: <AlertTriangle className="h-4 w-4" />, 
          className: 'bg-red-100 text-red-700 border-red-200',
          color: 'text-red-600'
        };
      case 'deforestation': 
        return { 
          icon: <TreePine className="h-4 w-4" />, 
          className: 'bg-orange-100 text-orange-700 border-orange-200',
          color: 'text-orange-600'
        };
      case 'water pollution': 
        return { 
          icon: <Droplets className="h-4 w-4" />, 
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          color: 'text-blue-600'
        };
      case 'air pollution': 
        return { 
          icon: <Wind className="h-4 w-4" />, 
          className: 'bg-purple-100 text-purple-700 border-purple-200',
          color: 'text-purple-600'
        };
      case 'wildlife endangerment': 
        return { 
          icon: <Leaf className="h-4 w-4" />, 
          className: 'bg-green-100 text-green-700 border-green-200',
          color: 'text-green-600'
        };
      default: 
        return { 
          icon: <AlertTriangle className="h-4 w-4" />, 
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          color: 'text-gray-600'
        };
    }
  };
  
  const statusConfig = getStatusVariant(report.status || 'pending');
  const issueConfig = getIssueTypeConfig(report.issueType);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <div 
        className="p-3 sm:p-5 hover:bg-gradient-to-r hover:from-climate-green/5 hover:to-transparent cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
        onClick={handleReportClick}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Enhanced Image Section - Mobile Responsive */}
          <div className="relative flex-shrink-0 self-start">
            <div className="w-full sm:w-20 md:w-24 h-32 sm:h-16 md:h-20 lg:h-24 rounded-xl overflow-hidden bg-muted border-2 border-border/50 group-hover:border-climate-green/30 transition-colors duration-300 shadow-sm">
              {report.images && report.images.length > 0 && report.images[0] ? (
                <img 
                  src={report.images[0]}
                  alt={report.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => { 
                    console.warn('Failed to load image:', report.images[0]);
                    e.currentTarget.src = '/placeholder.svg'; 
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            {report.images && report.images.length > 1 && (
              <Badge className="absolute -top-1 -right-1 bg-climate-green text-white text-xs px-1.5 py-0.5 rounded-full shadow-md">
                +{report.images.length - 1}
              </Badge>
            )}
          </div>
          
          {/* Enhanced Content Section - Mobile Responsive */}
          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            {/* Header with Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight group-hover:text-climate-green transition-colors duration-200 line-clamp-2 sm:line-clamp-3">
                {report.title}
              </h3>
              <Badge 
                variant={statusConfig.variant}
                className={`${statusConfig.className} font-medium text-xs shadow-sm self-start flex-shrink-0`}
              >
                {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'Pending'}
              </Badge>
            </div>
            
            {/* Enhanced Metadata - Mobile Responsive */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-climate-green flex-shrink-0" />
                <span className="font-medium truncate max-w-[120px] sm:max-w-none">{report.location}</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-amber-500 flex-shrink-0" />
                <span>{formatTimeAgo(report.date)}</span>
              </div>
            </div>
            
            {/* Issue Type Badge - Mobile Responsive */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${issueConfig.className} font-medium shadow-sm hover:shadow-md transition-shadow duration-200 text-xs`}
              >
                {issueConfig.icon}
                <span className="ml-1 sm:ml-1.5 truncate">{report.issueType}</span>
              </Badge>
            </div>
            
            {/* Enhanced Description - Mobile Responsive */}
            <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed text-sm sm:text-base">
              {report.description}
            </p>
            
            {/* Enhanced Engagement Section - Mobile Responsive */}
            <div className="flex items-center justify-between pt-1 sm:pt-2 gap-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center text-xs sm:text-sm font-medium">
                  <div className="bg-emerald-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2">
                    <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-emerald-700">{report.upvotes}</span>
                  <span className="text-muted-foreground ml-1 hidden sm:inline">upvotes</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm font-medium">
                  <div className="bg-blue-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2">
                    <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                  </div>
                  <span className="text-blue-700">{report.comments?.length || 0}</span>
                  <span className="text-muted-foreground ml-1 hidden sm:inline">comments</span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-climate-green hover:bg-climate-green/10 hover:text-climate-green-dark font-medium text-xs sm:text-sm p-1 sm:p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReportClick();
                }}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">View Details</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentReportItem;
