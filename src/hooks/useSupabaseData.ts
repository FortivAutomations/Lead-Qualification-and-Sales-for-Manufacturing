import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';

export type IncomingLead = Tables<'incoming_leads'>;
export type QualificationData = Tables<'qualification_data'>;
export type CallLogActivity = Tables<'call_logs_activity'>;

export interface LeadWithQualification extends IncomingLead {
  qualification_data?: QualificationData | null;
}

// Dashboard KPIs
export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      // Get average call duration (response time)
      const { data: callLogs } = await supabase
        .from('call_logs_activity')
        .select('call_duration')
        .not('call_duration', 'is', null);

      const avgResponseTime = callLogs && callLogs.length > 0
        ? Math.round(callLogs.reduce((acc, log) => acc + (log.call_duration || 0), 0) / callLogs.length)
        : 0;

      // Get active calls count
      const { count: activeCallsCount } = await supabase
        .from('call_logs_activity')
        .select('*', { count: 'exact', head: true })
        .eq('call_status', 'active');

      // Get total leads count
      const { count: totalLeadsCount } = await supabase
        .from('incoming_leads')
        .select('*', { count: 'exact', head: true });

      // Get qualification data count
      const { count: qualifiedCount } = await supabase
        .from('qualification_data')
        .select('*', { count: 'exact', head: true })
        .eq('qualification_status', 'Qualified');

      const qualificationRate = totalLeadsCount && totalLeadsCount > 0
        ? Math.round((qualifiedCount || 0) / totalLeadsCount * 100)
        : 0;

      // Get conversion rate (leads with status 'closed_won' or 'converted')
      const { count: convertedCount } = await supabase
        .from('incoming_leads')
        .select('*', { count: 'exact', head: true })
        .or('status.ilike.%closed%,status.ilike.%converted%,status.ilike.%won%');

      const conversionRate = totalLeadsCount && totalLeadsCount > 0
        ? Math.round((convertedCount || 0) / totalLeadsCount * 100)
        : 0;

      return {
        avgResponseTime,
        activeCallsCount: activeCallsCount || 0,
        qualificationRate,
        conversionRate,
        totalLeads: totalLeadsCount || 0,
        qualifiedLeads: qualifiedCount || 0,
      };
    },
  });
}

// Leads with qualification data
export function useLeadsWithQualification() {
  return useQuery({
    queryKey: ['leads-with-qualification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incoming_leads')
        .select(`
          *,
          qualification_data (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten the qualification_data array
      return (data || []).map((lead) => ({
        ...lead,
        qualification_data: Array.isArray(lead.qualification_data) 
          ? lead.qualification_data[0] || null 
          : lead.qualification_data,
      })) as LeadWithQualification[];
    },
  });
}

// Call logs with lead info (for conversations)
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_logs_activity')
        .select(`
          *,
          incoming_leads (
            company_name,
            contact_name,
            email_address,
            phone_number
          )
        `)
        .order('call_timestamp', { ascending: false });

      if (error) throw error;
      
      // Transform to flatten the incoming_leads join
      return (data || []).map((log) => ({
        ...log,
        incoming_leads: Array.isArray(log.incoming_leads) 
          ? log.incoming_leads[0] || null 
          : log.incoming_leads,
      }));
    },
  });
}

type DateRange = 'today' | 'this_week' | 'last_week' | 'this_month';

function getDateRangeFilter(range: DateRange): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return { start: today, end: now };
    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: now };
    }
    case 'last_week': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(today);
      endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }
    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: now };
    }
  }
}

// Helper to format date as YYYY-MM-DD in local timezone
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Lead volume by date for analytics
export function useLeadVolumeByDate(dateRange: DateRange = 'this_week') {
  return useQuery({
    queryKey: ['lead-volume-by-date', dateRange],
    queryFn: async () => {
      const { start, end } = getDateRangeFilter(dateRange);
      
      console.log('[LeadVolumeByDate] Date range:', dateRange);
      console.log('[LeadVolumeByDate] Start:', start.toISOString(), 'End:', end.toISOString());
      
      // Fetch ALL leads for simplicity, then filter client-side
      const { data, error } = await supabase
        .from('incoming_leads')
        .select('created_at, lead_source')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[LeadVolumeByDate] Query error:', error);
        throw error;
      }
      
      console.log('[LeadVolumeByDate] Raw data from Supabase:', data?.length, 'leads');

      // Generate all dates in range for consistent display
      const volumeByDate: Record<string, { date: string; leads: number; sources: Record<string, number> }> = {};
      
      // Pre-fill dates based on range using local date keys
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateKey = formatDateKey(currentDate);
        const displayDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        volumeByDate[dateKey] = { date: displayDate, leads: 0, sources: {} };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log('[LeadVolumeByDate] Date keys generated:', Object.keys(volumeByDate));
      
      // Count leads by date
      (data || []).forEach((lead) => {
        if (!lead.created_at) return;
        
        // Convert to local date for the key
        const leadDate = new Date(lead.created_at);
        const dateKey = formatDateKey(leadDate);
        
        // Check if this lead falls within our date range
        if (leadDate >= start && leadDate <= end && volumeByDate[dateKey]) {
          volumeByDate[dateKey].leads++;
          const source = lead.lead_source || 'Unknown';
          volumeByDate[dateKey].sources[source] = (volumeByDate[dateKey].sources[source] || 0) + 1;
        }
      });

      const result = Object.values(volumeByDate);
      console.log('[LeadVolumeByDate] Final chart data:', result);
      
      return result;
    },
  });
}

// Lead source performance
export function useLeadSourcePerformance() {
  return useQuery({
    queryKey: ['lead-source-performance'],
    queryFn: async () => {
      const { data: leads, error: leadsError } = await supabase
        .from('incoming_leads')
        .select('id, lead_source, status');

      if (leadsError) throw leadsError;

      const { data: qualifications, error: qualError } = await supabase
        .from('qualification_data')
        .select('lead_id, qualification_status');

      if (qualError) throw qualError;

      // Create a map of qualified lead IDs
      const qualifiedLeadIds = new Set(
        (qualifications || [])
          .filter(q => q.qualification_status === 'Qualified')
          .map(q => q.lead_id)
      );

      // Group by source
      const sourceStats: Record<string, { source: string; leads: number; qualified: number; rate: number }> = {};

      (leads || []).forEach((lead) => {
        const source = lead.lead_source || 'Unknown';
        if (!sourceStats[source]) {
          sourceStats[source] = { source, leads: 0, qualified: 0, rate: 0 };
        }
        sourceStats[source].leads++;
        if (qualifiedLeadIds.has(lead.id)) {
          sourceStats[source].qualified++;
        }
      });

      // Calculate rates
      Object.values(sourceStats).forEach((stat) => {
        stat.rate = stat.leads > 0 ? Math.round((stat.qualified / stat.leads) * 100) : 0;
      });

      return Object.values(sourceStats).sort((a, b) => b.leads - a.leads);
    },
  });
}

// Lead categories (Hot/Warm/Cold/Spam) from lead_type column

// Lead categories (Hot/Warm/Cold/Spam) from lead_type column
export function useLeadCategories() {
  return useQuery({
    queryKey: ['lead-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualification_data')
        .select('lead_type');

      if (error) throw error;

      // Count by lead_type
      const categoryCounts: Record<string, number> = {
        Hot: 0,
        Warm: 0,
        Cold: 0,
        Spam: 0,
      };

      (data || []).forEach((item) => {
        const leadType = item.lead_type?.toLowerCase() || '';
        
        if (leadType.includes('hot')) {
          categoryCounts.Hot++;
        } else if (leadType.includes('warm')) {
          categoryCounts.Warm++;
        } else if (leadType.includes('cold')) {
          categoryCounts.Cold++;
        } else if (leadType.includes('spam') || leadType.includes('invalid')) {
          categoryCounts.Spam++;
        } else if (leadType) {
          // Default unmatched to Cold
          categoryCounts.Cold++;
        }
      });

      return Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }));
    },
  });
}

// Real-time subscriptions
export function useRealtimeLeads() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('incoming_leads_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incoming_leads' },
        () => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['leads-with-qualification'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
          queryClient.invalidateQueries({ queryKey: ['lead-volume-by-date'] });
          queryClient.invalidateQueries({ queryKey: ['lead-source-performance'] });
          queryClient.invalidateQueries({ queryKey: ['pipeline-data'] });
          queryClient.invalidateQueries({ queryKey: ['lead-categories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeCallStatus() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('call_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'call_logs_activity' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
