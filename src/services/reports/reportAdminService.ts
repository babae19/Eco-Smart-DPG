
import { supabase } from '@/integrations/supabase/client';
import { Report } from './reportTypes';
import { mapDbReport } from './reportUtils';

// Helper to check admin status from user_roles table
const checkAdminRole = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  return !error && !!data;
};

// Admin function to approve a report
export const approveReport = async (reportId: string): Promise<Report | undefined> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return undefined;
    }

    const isAdmin = await checkAdminRole(user.user.id);
    if (!isAdmin) {
      console.error('User is not authorized to approve reports');
      return undefined;
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ status: 'approved' })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) {
      console.error('Error approving report:', error);
      return undefined;
    }
    
    return await mapDbReport(data);
  } catch (error) {
    console.error('Error in approveReport:', error);
    return undefined;
  }
};

// Admin function to reject a report
export const rejectReport = async (reportId: string): Promise<Report | undefined> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('User not authenticated');
      return undefined;
    }

    const isAdmin = await checkAdminRole(user.user.id);
    if (!isAdmin) {
      console.error('User is not authorized to reject reports');
      return undefined;
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ status: 'rejected' })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting report:', error);
      return undefined;
    }
    
    return await mapDbReport(data);
  } catch (error) {
    console.error('Error in rejectReport:', error);
    return undefined;
  }
};
