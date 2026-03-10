import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/services/reports/reportTypes';
import { toast } from '@/hooks/use-toast';

export const useRealtimeReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Fetch initial reports
  const fetchInitialReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the reports
      const { data: reportsData, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Then get profile information for each report
      const reportIds = reportsData?.map(report => report.created_by) || [];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', reportIds);

      // Get comments for each report
      const { data: commentsData } = await supabase
        .from('report_comments')
        .select(`
          id,
          text,
          created_at,
          report_id,
          author
        `)
        .in('report_id', reportsData?.map(r => r.id) || [])
        .order('created_at', { ascending: true });

      // Get profiles for comment authors
      const commentAuthorIds = commentsData?.map(c => c.author) || [];
      const { data: commentProfilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', commentAuthorIds);

      
      if (isMountedRef.current) {
        const transformedReports = (reportsData || []).map(item => {
          const authorProfile = profilesData?.find(p => p.id === item.created_by);
          const reportComments = commentsData?.filter(c => c.report_id === item.id) || [];
          
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            location: item.location,
            issueType: item.issue_type,
            images: item.images || [],
            date: item.created_at,
            status: (item.status || 'pending') as 'approved' | 'pending' | 'rejected',
            upvotes: item.upvotes,
            comments: reportComments.map(comment => {
              const commentProfile = commentProfilesData?.find(p => p.id === comment.author);
              return {
                id: comment.id,
                text: comment.text,
                author: commentProfile?.full_name || 'Anonymous',
                date: comment.created_at,
                authorProfile: commentProfile
              };
            }),
            likes: item.likes,
            createdBy: item.created_by,
            profiles: authorProfile || { full_name: 'Anonymous User', avatar_url: null }
          };
        });
        setReports(transformedReports);
        console.log(`[useRealtimeReports] Loaded ${transformedReports?.length || 0} reports`);
      }
    } catch (error) {
      console.error('[useRealtimeReports] Error fetching reports:', error);
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to load reports');
        toast({
          title: "Error Loading Reports",
          description: "Failed to fetch the latest reports.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Handle real-time inserts
  const handleRealtimeInsert = useCallback(async (payload: any) => {
    console.log('[useRealtimeReports] New report added:', payload.new);
    
    if (isMountedRef.current) {
      // Get author profile for the new report
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', payload.new.created_by)
        .single();

      setReports(currentReports => {
        // Check if report already exists to prevent duplicates
        const exists = currentReports.some(report => report.id === payload.new.id);
        if (exists) return currentReports;
        
        // Add new report at the top (most recent first)
        const newReport = {
          id: payload.new.id,
          title: payload.new.title,
          description: payload.new.description,
          location: payload.new.location,
          issueType: payload.new.issue_type,
          images: payload.new.images || [],
          date: payload.new.created_at,
          status: payload.new.status,
          upvotes: payload.new.upvotes,
          comments: [],
          likes: payload.new.likes,
          createdBy: payload.new.created_by,
          profiles: authorProfile || { full_name: 'Anonymous User', avatar_url: null }
        };
        
        return [newReport, ...currentReports];
      });
      
      // Show toast notification for new reports
      toast({
        title: "New Report",
        description: `New environmental report: ${payload.new.title}`,
        variant: "default"
      });
    }
  }, []);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('[useRealtimeReports] Report updated:', payload.new);
    
    if (isMountedRef.current) {
      setReports(currentReports => 
        currentReports.map(report => 
          report.id === payload.new.id 
            ? {
                ...report,
                title: payload.new.title,
                description: payload.new.description,
                location: payload.new.location,
                issueType: payload.new.issue_type,
                images: payload.new.images || [],
                status: payload.new.status,
                upvotes: payload.new.upvotes,
                likes: payload.new.likes
              }
            : report
        )
      );
    }
  }, []);

  // Handle real-time comment inserts
  const handleCommentInsert = useCallback(async (payload: any) => {
    console.log('[useRealtimeReports] New comment added:', payload.new);
    
    if (isMountedRef.current) {
      // Get author profile for the new comment
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', payload.new.author)
        .single();

      setReports(currentReports => 
        currentReports.map(report => 
          report.id === payload.new.report_id 
            ? {
                ...report,
                comments: [
                  ...report.comments,
                  {
                    id: payload.new.id,
                    text: payload.new.text,
                    author: authorProfile?.full_name || 'Anonymous',
                    date: payload.new.created_at,
                    authorProfile: authorProfile
                  }
                ]
              }
            : report
        )
      );
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    isMountedRef.current = true;
    
    // Fetch initial data
    fetchInitialReports();
    
    // Setup realtime subscription for reports
    channelRef.current = supabase
      .channel('reports_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        handleRealtimeInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports'
        },
        handleRealtimeUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_comments'
        },
        handleCommentInsert
      )
      .subscribe((status) => {
        console.log('[useRealtimeReports] Subscription status:', status);
      });

    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchInitialReports, handleRealtimeInsert, handleRealtimeUpdate, handleCommentInsert]);

  // Filter reports based on current filter
  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.issueType === filter);

  const refresh = useCallback(() => {
    fetchInitialReports();
  }, [fetchInitialReports]);

  return {
    reports: filteredReports,
    loading,
    error,
    filter,
    setFilter,
    refresh,
    totalCount: reports.length
  };
};