
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin authentication
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;

    console.log('[AI Debug Scheduler] Starting scheduled analysis by admin:', authResult.userId);
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tasks: []
    };

    // 1. Perform error analysis
    try {
      const errorAnalysis = await invokeFunction(supabase, 'ai-debug-agent', {
        action: 'analyze_errors',
        data: {}
      }, req);
      results.tasks.push({ name: 'error_analysis', status: 'completed', result: errorAnalysis });
      console.log('[AI Debug Scheduler] Error analysis completed');
    } catch (error) {
      results.tasks.push({ name: 'error_analysis', status: 'failed', error: error.message });
      console.error('[AI Debug Scheduler] Error analysis failed:', error);
    }

    // 2. Perform health check
    try {
      const healthCheck = await invokeFunction(supabase, 'ai-debug-agent', {
        action: 'health_check',
        data: {}
      }, req);
      results.tasks.push({ name: 'health_check', status: 'completed', result: healthCheck });
      console.log('[AI Debug Scheduler] Health check completed');
    } catch (error) {
      results.tasks.push({ name: 'health_check', status: 'failed', error: error.message });
      console.error('[AI Debug Scheduler] Health check failed:', error);
    }

    // 3. Monitor performance
    try {
      const performanceMonitoring = await invokeFunction(supabase, 'ai-debug-agent', {
        action: 'monitor_performance',
        data: {}
      }, req);
      results.tasks.push({ name: 'performance_monitoring', status: 'completed', result: performanceMonitoring });
      console.log('[AI Debug Scheduler] Performance monitoring completed');
    } catch (error) {
      results.tasks.push({ name: 'performance_monitoring', status: 'failed', error: error.message });
      console.error('[AI Debug Scheduler] Performance monitoring failed:', error);
    }

    // 4. Generate daily report
    try {
      const report = await generateDailyReport(supabase, results);
      results.tasks.push({ name: 'daily_report', status: 'completed', result: report });
      console.log('[AI Debug Scheduler] Daily report generated');
    } catch (error) {
      results.tasks.push({ name: 'daily_report', status: 'failed', error: error.message });
      console.error('[AI Debug Scheduler] Daily report generation failed:', error);
    }

    // Store scheduler run results
    await supabase.from('ai_scheduler_runs').insert({
      results: results,
      success_count: results.tasks.filter((t: any) => t.status === 'completed').length,
      failure_count: results.tasks.filter((t: any) => t.status === 'failed').length,
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI Debug Scheduler] Scheduler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function invokeFunction(supabase: any, functionName: string, payload: any, originalReq: Request) {
  // Forward the authorization header to child function calls
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      Authorization: originalReq.headers.get('Authorization') || ''
    }
  });

  if (error) {
    throw new Error(`Function ${functionName} failed: ${error.message}`);
  }

  return data;
}

async function generateDailyReport(supabase: any, schedulerResults: any) {
  console.log('[AI Debug Scheduler] Generating daily report');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const [
    { data: errors },
    { data: healthChecks },
    { data: performanceMetrics },
    { data: fixSuggestions }
  ] = await Promise.all([
    supabase.from('debug_logs').select('*').gte('created_at', yesterday),
    supabase.from('health_check_results').select('*').gte('created_at', yesterday),
    supabase.from('performance_metrics').select('*').gte('created_at', yesterday),
    supabase.from('ai_fix_suggestions').select('*').gte('created_at', yesterday)
  ]);

  const report = {
    period: `${yesterday} to ${new Date().toISOString()}`,
    summary: {
      totalErrors: errors?.length || 0,
      healthChecks: healthChecks?.length || 0,
      performanceChecks: performanceMetrics?.length || 0,
      fixesSuggested: fixSuggestions?.length || 0
    },
    criticalIssues: errors?.filter((e: any) => e.severity === 'critical')?.slice(0, 5) || [],
    recommendations: [
      'Regular monitoring is active',
      'AI analysis is functioning properly',
      'System health checks are running'
    ],
    schedulerStatus: schedulerResults
  };

  await supabase.from('ai_daily_reports').insert({
    report: report,
    created_at: new Date().toISOString()
  });

  return report;
}
