import { useState } from 'react';
import { LeadWithQualification } from '@/hooks/useSupabaseData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FollowUpModal } from '@/components/leads/FollowUpModal';

interface RecentLeadsTableProps {
  leads: LeadWithQualification[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  qualified: { label: 'Qualified', className: 'status-qualified' },
  Qualified: { label: 'Qualified', className: 'status-qualified' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  'In Progress': { label: 'In Progress', className: 'status-in-progress' },
  new: { label: 'New', className: 'status-in-progress' },
  New: { label: 'New', className: 'status-in-progress' },
  unqualified: { label: 'Unqualified', className: 'status-unqualified' },
  Unqualified: { label: 'Unqualified', className: 'status-unqualified' },
  escalated: { label: 'Escalated', className: 'status-escalated' },
  Escalated: { label: 'Escalated', className: 'status-escalated' },
  contacted: { label: 'Contacted', className: 'status-qualified' },
  Contacted: { label: 'Contacted', className: 'status-qualified' },
};

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewLead = (lead: LeadWithQualification) => {
    setSelectedLeadId(lead.id);
    setSelectedCompanyName(lead.company_name || 'Unknown Company');
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg">Recent Leads</h3>
            <p className="text-sm text-muted-foreground">Latest inquiries from Supabase</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/leads">
              View All <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.slice(0, 8).map((lead) => {
                const status = statusConfig[lead.status || ''] || { label: lead.status || 'Unknown', className: '' };
                
                return (
                  <tr key={lead.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{lead.company_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {lead.initial_interest_notes?.substring(0, 40) || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('status-badge', status.className)}>{status.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewLead(lead)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No leads found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FollowUpModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        leadId={selectedLeadId}
        companyName={selectedCompanyName}
      />
    </>
  );
}
