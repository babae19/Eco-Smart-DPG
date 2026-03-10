
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReportById, upvoteReport, likeReport, addComment } from '@/services/reportService';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ReportDetailHeader } from '@/components/reports/detail/ReportDetailHeader';
import { ReportDetailMedia } from '@/components/reports/detail/ReportDetailMedia';
import { ReportDetailContent } from '@/components/reports/detail/ReportDetailContent';
import { ReportDetailActions } from '@/components/reports/detail/ReportDetailActions';
import { ReportDetailComments } from '@/components/reports/detail/ReportDetailComments';
import { ReportDetailSkeleton } from '@/components/reports/detail/ReportDetailSkeleton';
import { ReportDetailNotFound } from '@/components/reports/detail/ReportDetailNotFound';
import { Report } from '@/services/reports/reportTypes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ReportDetail: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!reportId) return;
      
      try {
        setLoading(true);
        const reportData = await getReportById(reportId);
        
        if (reportData) {
          setReport(reportData);
        } else {
          toast({
            title: "Error",
            description: "Report not found",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
        toast({
          title: "Error",
          description: "Failed to load report details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportDetail();
  }, [reportId, toast]);
  
  const handleUpvote = async () => {
    if (!report || !isAuthenticated) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upvote reports",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      const updatedReport = await upvoteReport(report.id);
      if (updatedReport) {
        setReport(updatedReport);
        toast({
          title: "Upvoted",
          description: "Thank you for supporting this issue"
        });
      }
    } catch (error) {
      console.error("Error upvoting report:", error);
      toast({
        title: "Error",
        description: "Failed to upvote report",
        variant: "destructive"
      });
    }
  };
  
  const handleLike = async () => {
    if (!report || !isAuthenticated) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like reports",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      const updatedReport = await likeReport(report.id);
      if (updatedReport) {
        setReport(updatedReport);
        toast({
          title: "Liked",
          description: "You liked this report"
        });
      }
    } catch (error) {
      console.error("Error liking report:", error);
      toast({
        title: "Error",
        description: "Failed to like report",
        variant: "destructive"
      });
    }
  };
  
  const handleAddComment = async (commentText: string) => {
    if (!report || !isAuthenticated) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to comment",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      const updatedReport = await addComment(report.id, commentText);
      if (updatedReport) {
        setReport(updatedReport);
        toast({
          title: "Comment Added",
          description: "Your comment has been added"
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Report Details" showBackButton />
      
      <div className="p-4">
        {loading ? (
          <ReportDetailSkeleton />
        ) : !report ? (
          <ReportDetailNotFound />
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-5">
            <ReportDetailMedia 
              images={report.images} 
              title={report.title} 
              status={report.status}
            />
            
            <ReportDetailHeader 
              title={report.title}
              issueType={report.issueType}
              status={report.status}
              location={report.location}
              date={report.date}
              createdBy={report.createdBy}
            />
            
            <ReportDetailContent 
              description={report.description}
              images={report.images}
            />
            
            <ReportDetailActions 
              reportId={report.id}
              upvotes={report.upvotes}
              likes={report.likes}
              onUpvote={handleUpvote}
              onLike={handleLike}
            />
            
            <ReportDetailComments 
              comments={report.comments}
              onAddComment={handleAddComment}
            />
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ReportDetail;
