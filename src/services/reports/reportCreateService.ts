
import { supabase } from '@/integrations/supabase/client';
import { Report } from './reportTypes';
import { mapDbReport } from './reportUtils';
import { toast } from '@/hooks/use-toast';
import { validateReportInput, sanitizeText } from '@/utils/validation';

// Add a new report
export const addReport = async (
  report: Omit<Report, 'id' | 'date' | 'status' | 'upvotes' | 'comments' | 'likes' | 'createdBy'>
): Promise<Report | undefined> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be logged in to create a report');
    }

    // Validate input data
    const validation = validateReportInput({
      title: report.title,
      description: report.description,
      location: report.location,
      issueType: report.issueType
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return undefined;
    }
    
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        title: sanitizeText(report.title),
        description: sanitizeText(report.description),
        location: report.location ? sanitizeText(report.location) : null,
        issue_type: sanitizeText(report.issueType),
        images: report.images,
        created_by: user.data.user.id,
        // Set initial status as pending for admin review
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating report:', error);
      return undefined;
    }
    
    // Show toast notification for successful submission
    toast({
      title: "Report Submitted",
      description: "Your community report has been submitted and is pending review.",
      variant: "default",
    });
    
    return await mapDbReport(data);
  } catch (error) {
    console.error('Error in addReport:', error);
    return undefined;
  }
};
