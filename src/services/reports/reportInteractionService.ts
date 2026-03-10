
import { supabase } from '@/integrations/supabase/client';
import { Report } from './reportTypes';
import { mapDbReport } from './reportUtils';
import { getReportById } from './reportFetchService';

// Upvote a report
export const upvoteReport = async (id: string): Promise<Report | undefined> => {
  try {
    // First get the current report
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching report to upvote:', fetchError);
      return undefined;
    }
    
    // Update the upvotes count
    const { data, error } = await supabase
      .from('reports')
      .update({ upvotes: (report.upvotes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error upvoting report:', error);
      return undefined;
    }
    
    return await mapDbReport(data);
  } catch (error) {
    console.error('Error in upvoteReport:', error);
    return undefined;
  }
};

// Like a report
export const likeReport = async (id: string): Promise<Report | undefined> => {
  try {
    // First get the current report
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching report to like:', fetchError);
      return undefined;
    }
    
    // Update the likes count
    const { data, error } = await supabase
      .from('reports')
      .update({ likes: (report.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error liking report:', error);
      return undefined;
    }
    
    return await mapDbReport(data);
  } catch (error) {
    console.error('Error in likeReport:', error);
    return undefined;
  }
};

// Add a comment to a report
export const addComment = async (reportId: string, commentText: string): Promise<Report | undefined> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be logged in to comment');
    }
    
    const { error } = await supabase
      .from('report_comments')
      .insert([{
        report_id: reportId,
        text: commentText,
        author: user.data.user.id
      }]);
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }
    
    // Fetch the updated report with the new comment
    return await getReportById(reportId);
  } catch (error) {
    console.error('Error in addComment:', error);
    return undefined;
  }
};

// Delete a report
export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return false;
  }
};
