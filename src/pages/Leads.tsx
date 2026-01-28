import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLeadsWithQualification, useRealtimeLeads, LeadWithQualification } from '@/hooks/useSupabaseData';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { FollowUpModal } from '@/components/leads/FollowUpModal';
import { LeadQualificationModal } from '@/components/leads/LeadQualificationModal';
import { useCsvOperations } from '@/hooks/useCsvOperations';
import { toast } from 'sonner';

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

export default function Leads() {
  useRealtimeLeads();
  
  const { data: allLeads, isLoading } = useLeadsWithQualification();
  const { exportCsv, isExporting } = useCsvOperations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Follow-up Modal state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lead Qualification Modal state
  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);

  const handleViewFollowUp = (lead: LeadWithQualification) => {
    setSelectedLeadId(lead.id);
    setSelectedCompanyName(lead.company_name || 'Unknown Company');
    setIsModalOpen(true);
  };

  const [isQualifying, setIsQualifying] = useState(false);

  const handleInitiateQualification = async () => {
    setIsQualifying(true);
    try {
      const response = await fetch('https://n8n.srv1241696.hstgr.cloud/webhook-test/b418c48c-77e9-4216-91c1-6be1cee84108', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: 'initiate_lead_qualification',
          triggered_from: window.location.origin,
        }),
      });
      
      toast.success('Lead qualification initiated successfully');
    } catch (error) {
      console.error('Error triggering lead qualification:', error);
      toast.error('Failed to initiate lead qualification. Please try again.');
    } finally {
      setIsQualifying(false);
    }
  };

  // Get unique sources and industries for filter dropdowns
  const { sources, industries } = useMemo(() => {
    const sourceSet = new Set<string>();
    const industrySet = new Set<string>();
    (allLeads || []).forEach((lead) => {
      if (lead.lead_source) sourceSet.add(lead.lead_source);
      if (lead.industry_sector) industrySet.add(lead.industry_sector);
    });
    return {
      sources: Array.from(sourceSet).sort(),
      industries: Array.from(industrySet).sort(),
    };
  }, [allLeads]);

  const filteredLeads = useMemo(() => {
    return (allLeads || []).filter((lead) => {
      const matchesSearch =
        (lead.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (lead.contact_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (lead.email_address?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.lead_source === sourceFilter;
      const matchesIndustry = industryFilter === 'all' || lead.industry_sector === industryFilter;
      return matchesSearch && matchesStatus && matchesSource && matchesIndustry;
    });
  }, [allLeads, searchQuery, statusFilter, sourceFilter, industryFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  if (isLoading) {
    return (
      <DashboardLayout title="Lead Management" subtitle="Manage and track all incoming leads">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Lead Management" subtitle="Manage and track all incoming leads">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col items-end gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> More Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={exportCsv}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => setIsQualificationModalOpen(true)}
          >
            <PlayCircle className="w-4 h-4" /> Initiate Lead Qualification
          </Button>
        </div>
      </div>

      {/* Results count */}
      {/* Results count */}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedLeads.length} of {filteredLeads.length} leads
        </p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Industry</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedLeads.map((lead) => {
                const status = statusConfig[lead.status || ''] || { label: lead.status || 'Unknown', className: '' };
                return (
                  <tr key={lead.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{lead.company_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{lead.initial_interest_notes?.substring(0, 30) || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{lead.contact_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{lead.email_address || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{lead.lead_source || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{lead.industry_sector || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('status-badge', status.className)}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">
                          {lead.created_at ? format(new Date(lead.created_at), 'MMM d, h:mm a') : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.created_at && formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewFollowUp(lead)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {paginatedLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No leads found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      <FollowUpModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        leadId={selectedLeadId}
        companyName={selectedCompanyName}
      />

      {/* Lead Qualification Modal */}
      <LeadQualificationModal
        open={isQualificationModalOpen}
        onOpenChange={setIsQualificationModalOpen}
        onConfirm={handleInitiateQualification}
      />
    </DashboardLayout>
  );
}
