import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LeadVolumeChart } from '@/components/dashboard/LeadVolumeChart';
import { LeadCategoriesChart } from '@/components/dashboard/LeadCategoriesChart';
import { RecentLeadsTable } from '@/components/dashboard/RecentLeadsTable';
import { useDashboardKPIs, useLeadsWithQualification, useRealtimeLeads, useRealtimeCallStatus } from '@/hooks/useSupabaseData';
import { Target, TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  // Enable real-time subscriptions
  useRealtimeLeads();
  useRealtimeCallStatus();

  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: leads, isLoading: leadsLoading } = useLeadsWithQualification();

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="AI-powered sales automation overview"
    >
      {/* Key Metrics - Only 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Leads"
              value={String(kpis?.totalLeads || 0)}
              subtitle="All incoming leads"
              icon={<Users className="w-6 h-6" />}
              variant="primary"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${kpis?.conversionRate || 0}%`}
              subtitle="Leads to closed"
              icon={<TrendingUp className="w-6 h-6" />}
              trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            />
            <MetricCard
              title="Qualification Rate"
              value={`${kpis?.qualificationRate || 0}%`}
              subtitle="From qualification data"
              icon={<Target className="w-6 h-6" />}
              trend={{ value: 8, direction: 'up', label: 'vs last month' }}
            />
          </>
        )}
      </div>

      {/* Charts Row - Daily Lead Intake & Lead Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <LeadVolumeChart />
        </div>
        <LeadCategoriesChart />
      </div>

      {/* Recent Leads Table */}
      {leadsLoading ? (
        <Skeleton className="h-[400px] rounded-xl" />
      ) : (
        <RecentLeadsTable leads={leads || []} />
      )}
    </DashboardLayout>
  );
}
