import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFollowUpByLeadId, FollowUp } from '@/hooks/useFollowUp';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  companyName?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/20 text-warning' },
  Pending: { label: 'Pending', className: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', className: 'bg-success/20 text-success' },
  Completed: { label: 'Completed', className: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/20 text-destructive' },
  Cancelled: { label: 'Cancelled', className: 'bg-destructive/20 text-destructive' },
  scheduled: { label: 'Scheduled', className: 'bg-primary/20 text-primary' },
  Scheduled: { label: 'Scheduled', className: 'bg-primary/20 text-primary' },
};

export function FollowUpModal({ open, onOpenChange, leadId, companyName }: FollowUpModalProps) {
  const { data: followUps, isLoading } = useFollowUpByLeadId(leadId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Follow-up Details</DialogTitle>
          {companyName && (
            <p className="text-sm text-muted-foreground">{companyName}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : followUps && followUps.length > 0 ? (
            followUps.map((followUp) => (
              <FollowUpCard key={followUp.id} followUp={followUp} />
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No follow-ups scheduled for this lead</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FollowUpCard({ followUp }: { followUp: FollowUp }) {
  const status = statusConfig[followUp.status || ''] || { label: followUp.status || 'Unknown', className: 'bg-muted text-muted-foreground' };

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Follow-up Type */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium capitalize">
              {followUp.followup_type?.replace(/_/g, ' ') || 'General Follow-up'}
            </span>
          </div>

          {/* Scheduled Date */}
          {followUp.scheduled_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{followUp.scheduled_at}</span>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Created {format(new Date(followUp.created_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>

        {/* Status Badge */}
        <span className={cn('px-2 py-1 rounded-md text-xs font-medium', status.className)}>
          {status.label}
        </span>
      </div>
    </div>
  );
}
