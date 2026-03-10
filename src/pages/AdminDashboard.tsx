
import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, RefreshCcw, Bell } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Campaign, CampaignGoal } from '@/models/Campaign';
import { Report } from '@/services/reportService';
import { 
  approveCampaign, 
  rejectCampaign, 
  getCampaignById 
} from '@/services/campaigns';
import {
  approveReport,
  rejectReport,
  getReportById
} from '@/services/reportService';

// Define Alert interface
interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_by: string;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [pendingAlerts, setPendingAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<string>('campaigns');
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !profile) {
        navigate('/login');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', profile.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/home');
          return;
        }
        
        setIsAdmin(true);
        fetchPendingItems();
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [isAuthenticated, profile, navigate, toast]);
  
  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // Fetch pending campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (campaignsError) throw campaignsError;
      
      // Fetch pending reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (reportsError) throw reportsError;
      
      // Fetch pending alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (alertsError) throw alertsError;
      
      // Convert to our model format
      const campaigns: Campaign[] = campaignsData.map(c => ({
        id: c.id,
        title: c.title,
        goal: c.goal as CampaignGoal, // Cast string to CampaignGoal
        endDate: new Date(c.end_date),
        imageUrl: c.image_url,
        createdAt: new Date(c.created_at),
        createdBy: c.created_by,
        supporters: c.supporters,
        status: (c.status || 'pending') as 'pending' | 'approved' | 'rejected',
        description: c.description
      }));
      
      const reports: Report[] = reportsData.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        location: r.location || '',
        issueType: r.issue_type,
        images: r.images || [],
        date: new Date(r.created_at).toISOString().split('T')[0],
        status: (r.status || 'pending') as 'approved' | 'pending' | 'rejected',
        upvotes: r.upvotes,
        comments: [],
        likes: r.likes,
        createdBy: r.created_by
      }));
      
      setPendingCampaigns(campaigns);
      setPendingReports(reports);
      setPendingAlerts(alertsData as Alert[]);
    } catch (error) {
      console.error("Error fetching pending items:", error);
      toast({
        title: "Error",
        description: "Failed to load pending items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveCampaign = async (id: string) => {
    try {
      await approveCampaign(id);
      setPendingCampaigns(pendingCampaigns.filter(c => c.id !== id));
      toast({
        title: "Campaign Approved",
        description: "The campaign has been approved and is now visible to all users",
      });
    } catch (error) {
      console.error("Error approving campaign:", error);
      toast({
        title: "Error",
        description: "Failed to approve campaign",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectCampaign = async (id: string) => {
    try {
      await rejectCampaign(id);
      setPendingCampaigns(pendingCampaigns.filter(c => c.id !== id));
      toast({
        title: "Campaign Rejected",
        description: "The campaign has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to reject campaign",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveReport = async (id: string) => {
    try {
      await approveReport(id);
      setPendingReports(pendingReports.filter(r => r.id !== id));
      toast({
        title: "Report Approved",
        description: "The report has been approved and is now visible to all users",
      });
    } catch (error) {
      console.error("Error approving report:", error);
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectReport = async (id: string) => {
    try {
      await rejectReport(id);
      setPendingReports(pendingReports.filter(r => r.id !== id));
      toast({
        title: "Report Rejected",
        description: "The report has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast({
        title: "Error",
        description: "Failed to reject report",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveAlert = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      setPendingAlerts(pendingAlerts.filter(a => a.id !== id));
      toast({
        title: "Alert Approved",
        description: "The alert has been approved and is now visible to all users",
      });
    } catch (error) {
      console.error("Error approving alert:", error);
      toast({
        title: "Error",
        description: "Failed to approve alert",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectAlert = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      setPendingAlerts(pendingAlerts.filter(a => a.id !== id));
      toast({
        title: "Alert Rejected",
        description: "The alert has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting alert:", error);
      toast({
        title: "Error",
        description: "Failed to reject alert",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header title="Admin Dashboard" showBackButton />
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Admin Dashboard" showBackButton />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={fetchPendingItems}>
            <RefreshCcw size={16} className="mr-1" /> Refresh
          </Button>
        </div>
        
        <Tabs defaultValue="campaigns" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="campaigns">
              Campaigns ({pendingCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts ({pendingAlerts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns">
            {pendingCampaigns.length > 0 ? (
              <div className="space-y-4">
                {pendingCampaigns.map(campaign => (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(campaign.createdAt, 'MMM d, yyyy')} • {campaign.goal}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleApproveCampaign(campaign.id)}
                        >
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectCampaign(campaign.id)}
                        >
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-gray-700 text-sm">{campaign.description || 'No description provided.'}</p>
                    </div>
                    
                    {campaign.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title} 
                          className="h-32 w-auto object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center">
                <AlertTriangle size={32} className="mx-auto text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium">No Pending Campaigns</h3>
                <p className="text-gray-500 mt-1">All campaigns have been reviewed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            {pendingReports.length > 0 ? (
              <div className="space-y-4">
                {pendingReports.map(report => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {report.date} • {report.issueType}
                        </p>
                        {report.location && (
                          <p className="text-xs text-gray-500 mt-1">{report.location}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleApproveReport(report.id)}
                        >
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectReport(report.id)}
                        >
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-gray-700 text-sm">{report.description}</p>
                    </div>
                    
                    {report.images && report.images.length > 0 && (
                      <div className="mt-2 flex space-x-2 overflow-x-auto">
                        {report.images.map((image, index) => (
                          <img 
                            key={index} 
                            src={image} 
                            alt={`${report.title} image ${index + 1}`} 
                            className="h-32 w-auto object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center">
                <AlertTriangle size={32} className="mx-auto text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium">No Pending Reports</h3>
                <p className="text-gray-500 mt-1">All reports have been reviewed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alerts">
            {pendingAlerts.length > 0 ? (
              <div className="space-y-4">
                {pendingAlerts.map(alert => (
                  <div key={alert.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-sm text-gray-500">
                          {alert.date} • Severity: {alert.severity}
                        </p>
                        {alert.location && (
                          <p className="text-xs text-gray-500 mt-1">{alert.location}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleApproveAlert(alert.id)}
                        >
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectAlert(alert.id)}
                        >
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-gray-700 text-sm">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center">
                <AlertTriangle size={32} className="mx-auto text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium">No Pending Alerts</h3>
                <p className="text-gray-500 mt-1">All alerts have been reviewed.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AdminDashboard;
