import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useConversations, useRealtimeCallStatus } from '@/hooks/useSupabaseData';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  Bot,
  User,
  ChevronRight,
  ExternalLink,
  Play,
} from 'lucide-react';

const sentimentConfig: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: 'Positive', color: 'text-success', bg: 'bg-success/10' },
  Positive: { label: 'Positive', color: 'text-success', bg: 'bg-success/10' },
  neutral: { label: 'Neutral', color: 'text-muted-foreground', bg: 'bg-muted' },
  Neutral: { label: 'Neutral', color: 'text-muted-foreground', bg: 'bg-muted' },
  negative: { label: 'Negative', color: 'text-destructive', bg: 'bg-destructive/10' },
  Negative: { label: 'Negative', color: 'text-destructive', bg: 'bg-destructive/10' },
};

type ConversationItem = {
  id: string;
  lead_id: string | null;
  company: string;
  contact: string;
  timestamp: Date;
  duration: string;
  sentiment: string;
  status: string;
  summary: string | null;
  recordingUrl: string | null;
  nextAction: string | null;
};

export default function Conversations() {
  useRealtimeCallStatus();
  
  const { data: callLogs, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Transform call logs to conversation items
  const conversations = useMemo(() => {
    return (callLogs || []).map((log): ConversationItem => ({
      id: log.id,
      lead_id: log.lead_id,
      company: log.incoming_leads?.company_name || 'Unknown Company',
      contact: log.incoming_leads?.contact_name || 'Unknown Contact',
      timestamp: new Date(log.call_timestamp || log.created_at || Date.now()),
      duration: log.call_duration ? formatDuration(log.call_duration) : 'N/A',
      sentiment: log.sentiment_score || 'neutral',
      status: log.call_status || 'Unknown',
      summary: log.call_summary,
      recordingUrl: log.call_recording_url,
      nextAction: log.next_action_required,
    }));
  }, [callLogs]);

  // Set first conversation as selected by default
  useMemo(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (conv) =>
        conv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <DashboardLayout title="Conversation Transcripts" subtitle="AI agent conversation history and insights">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <Skeleton className="h-full rounded-xl" />
          <Skeleton className="lg:col-span-2 h-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Conversation Transcripts"
      subtitle="AI agent conversation history and insights"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const sentiment = sentimentConfig[conv.sentiment] || sentimentConfig.neutral;
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                        isSelected && 'bg-muted/50 border-l-2 border-l-primary'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{conv.company}</p>
                          <p className="text-sm text-muted-foreground">{conv.contact}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {conv.duration}
                        </span>
                        <span className={cn('flex items-center gap-1', sentiment.color)}>
                          <TrendingUp className="w-3 h-3" />
                          {sentiment.label}
                        </span>
                        <span>{formatDistanceToNow(conv.timestamp, { addSuffix: true })}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation Detail */}
        {selectedConversation ? (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedConversation.company}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.contact} •{' '}
                    {format(selectedConversation.timestamp, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedConversation.status}</Badge>
                  {sentimentConfig[selectedConversation.sentiment] && (
                    <Badge
                      variant="outline"
                      className={sentimentConfig[selectedConversation.sentiment].bg}
                    >
                      {sentimentConfig[selectedConversation.sentiment].label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Summary Section */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">

                  {/* Recording Link */}
                  {selectedConversation.recordingUrl && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Call Recording
                      </h4>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedConversation.recordingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Listen to Recording
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Call Summary */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Call Summary
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {selectedConversation.summary || 'No summary available for this call.'}
                      </p>
                    </div>
                  </div>

                  {/* Next Action */}
                  {selectedConversation.nextAction && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Next Action Required
                      </h4>
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                        <p className="text-sm text-foreground">{selectedConversation.nextAction}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-card rounded-xl border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Select a conversation to view details</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
