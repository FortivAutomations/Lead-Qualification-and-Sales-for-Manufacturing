import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FollowUp {
  id: string;
  lead_id: string | null;
  followup_type: string | null;
  scheduled_at: string | null;
  status: string | null;
  created_at: string;
}

export function useFollowUpByLeadId(leadId: string | null) {
  return useQuery({
    queryKey: ['follow-up', leadId],
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('follow_up')
        .select('*')
        .eq('lead_id', leadId)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('[FollowUp] Query error:', error);
        throw error;
      }

      return data as FollowUp[];
    },
    enabled: !!leadId,
  });
}
