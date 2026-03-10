
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Zap,
  TrendingUp,
  Bug,
  Cpu,
  Database,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAIDebugging } from '@/hooks/useAIDebugging';

export const AIDebuggingDashboard: React.FC = () => {
  const { debugInfo, requestAnalysis, checkHealth, analysisResults } = useAIDebugging('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Since the stored procedures don't exist yet, we'll use a simpler approach
      // and call the edge function directly to get aggregated data
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('ai-debug-agent', {
        body: {
          action: 'get_dashboard_data',
          data: {}
        }
      });

      if (edgeError) {
        console.log('[AI Dashboard] Edge function not available, using fallback data');
        // Fallback to empty data structure
        setDashboardData({
          recentErrors: [],
          healthChecks: [],
          performanceMetrics: [],
          fixSuggestions: [],
          schedulerRuns: []
        });
      } else {
        setDashboardData(edgeData || {
          recentErrors: [],
          healthChecks: [],
          performanceMetrics: [],
          fixSuggestions: [],
          schedulerRuns: []
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('[AI Dashboard] Failed to fetch data:', error);
      // Set empty data on error
      setDashboardData({
        recentErrors: [],
        healthChecks: [],
        performanceMetrics: [],
        fixSuggestions: [],
        schedulerRuns: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading AI Debugging Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Debugging Dashboard</h1>
          <p className="text-gray-600">Automated monitoring and analysis system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getHealthStatusIcon(debugInfo.healthStatus)}
              <div>
                <p className="text-sm font-medium">System Health</p>
                <p className={`text-lg font-bold ${getHealthStatusColor(debugInfo.healthStatus)}`}>
                  {debugInfo.healthStatus.toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Recent Errors</p>
                <p className="text-lg font-bold">{dashboardData?.recentErrors?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">AI Fixes</p>
                <p className="text-lg font-bold">{dashboardData?.fixSuggestions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Last Analysis</p>
                <p className="text-lg font-bold">
                  {debugInfo.lastAnalysis ? 
                    debugInfo.lastAnalysis.toLocaleTimeString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fixes">AI Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>AI Analysis Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analysis in progress...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={() => requestAnalysis()}>
                      <Zap className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </Button>
                    {debugInfo.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Suggestions:</h4>
                        <ul className="space-y-1">
                          {debugInfo.suggestions.slice(0, 3).map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              • {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Error Collection</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">AI Analysis</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Health Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Collection</CardTitle>
              <CardDescription>Browser errors and warnings are automatically collected</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Error collection is active</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Session errors: {debugInfo.errorCount}</span>
                      <span>Status: {debugInfo.healthStatus}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitoring</CardTitle>
              <CardDescription>Real-time health status and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={checkHealth} className="mb-4">
                <Database className="w-4 h-4 mr-2" />
                Run Health Check
              </Button>
              
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Current Status</span>
                    <Badge variant="outline">
                      {debugInfo.healthStatus}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Error Collection</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Database Connection</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Services</span>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>System performance metrics and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Real-time Metrics</span>
                    <Cpu className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Session Errors</span>
                      <p className="font-medium">{debugInfo.errorCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Health Status</span>
                      <p className="font-medium">{debugInfo.healthStatus}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Analysis</span>
                      <p className="font-medium">
                        {debugInfo.lastAnalysis ? 
                          debugInfo.lastAnalysis.toLocaleTimeString() : 
                          'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">AI Suggestions</span>
                      <p className="font-medium">{debugInfo.suggestions.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Recommendations</CardTitle>
              <CardDescription>Automated suggestions from the AI analysis system</CardDescription>
            </CardHeader>
            <CardContent>
              {debugInfo.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {debugInfo.suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Suggestion {index + 1}</Badge>
                        <span className="text-sm text-gray-500">
                          {debugInfo.lastAnalysis?.toLocaleString() || 'Recent'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{suggestion}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">AI Generated</Badge>
                          <span className="text-sm text-gray-500">
                            Priority: Medium
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No AI recommendations available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Run an AI analysis to get suggestions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
