
import { supabase } from '@/integrations/supabase/client';
import { Comment, Report } from './reportTypes';

// Helper to process image data from database (handles both string[] and object[] formats)
const processImageData = (images: any): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(image => {
    // Handle new format: {_type: "String", value: "data:image..."}
    if (typeof image === 'object' && image._type === 'String' && image.value) {
      return image.value;
    }
    // Handle legacy format: direct string
    if (typeof image === 'string') {
      return image;
    }
    // Fallback - return empty if invalid format
    console.warn('Invalid image format detected:', image);
    return '';
  }).filter(img => img.length > 0); // Remove empty strings
};

// Helper to convert database report to our Report model (optimized for list view)
export const mapDbReport = async (dbReport: any, includeComments = false): Promise<Report> => {
  let comments: Comment[] = [];
  
  // Only fetch comments when explicitly requested (e.g., detail view)
  if (includeComments) {
    const { data: commentsData, error: commentsError } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', dbReport.id)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    comments = commentsData?.map(comment => ({
      id: comment.id,
      text: comment.text,
      author: comment.author,
      date: new Date(comment.created_at).toISOString().split('T')[0]
    })) || [];
  }
  
  // Process images to handle both old and new data formats
  const processedImages = processImageData(dbReport.images);
  
  return {
    id: dbReport.id,
    title: dbReport.title,
    description: dbReport.description,
    location: dbReport.location || '',
    issueType: dbReport.issue_type,
    images: processedImages,
    date: new Date(dbReport.created_at).toISOString().split('T')[0],
    status: dbReport.status || 'pending',
    upvotes: dbReport.upvotes || 0,
    comments,
    likes: dbReport.likes || 0,
    createdBy: dbReport.created_by
  };
};

// Optimized function to get comments separately
export const getReportComments = async (reportId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return data?.map(comment => ({
      id: comment.id,
      text: comment.text,
      author: comment.author,
      date: new Date(comment.created_at).toISOString().split('T')[0]
    })) || [];
  } catch (error) {
    console.error('Error in getReportComments:', error);
    return [];
  }
};
