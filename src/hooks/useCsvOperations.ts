import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCsvOperations() {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const importCsv = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const rows = lines.slice(1);

      const leads = rows.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const lead: Record<string, string | null> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || null;
          // Map common CSV headers to database columns
          switch (header) {
            case 'company':
            case 'company_name':
              lead.company_name = value;
              break;
            case 'contact':
            case 'contact_name':
            case 'name':
              lead.contact_name = value;
              break;
            case 'phone':
            case 'phone_number':
              lead.phone_number = value;
              break;
            case 'email':
            case 'email_address':
              lead.email_address = value;
              break;
            case 'industry':
            case 'industry_sector':
              lead.industry_sector = value;
              break;
            case 'source':
            case 'lead_source':
              lead.lead_source = value;
              break;
            case 'status':
              lead.status = value || 'new';
              break;
            case 'notes':
            case 'initial_interest_notes':
              lead.initial_interest_notes = value;
              break;
            case 'website':
              lead.website = value;
              break;
          }
        });

        // Set default status if not provided
        if (!lead.status) {
          lead.status = 'new';
        }

        return lead;
      }).filter(lead => lead.company_name || lead.contact_name || lead.email_address);

      if (leads.length === 0) {
        toast.error('No valid leads found in CSV file');
        return;
      }

      const { error } = await supabase
        .from('incoming_leads')
        .insert(leads);

      if (error) throw error;

      toast.success(`Successfully imported ${leads.length} leads`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('Failed to import CSV file');
    } finally {
      setIsImporting(false);
    }
  };

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('incoming_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No leads to export');
        return;
      }

      // Create CSV content
      const headers = [
        'Company Name',
        'Contact Name',
        'Phone Number',
        'Email Address',
        'Industry Sector',
        'Lead Source',
        'Status',
        'Initial Interest Notes',
        'Website',
        'Created At'
      ];

      const csvRows = [
        headers.join(','),
        ...data.map(lead => [
          `"${lead.company_name || ''}"`,
          `"${lead.contact_name || ''}"`,
          `"${lead.phone_number || ''}"`,
          `"${lead.email_address || ''}"`,
          `"${lead.industry_sector || ''}"`,
          `"${lead.lead_source || ''}"`,
          `"${lead.status || ''}"`,
          `"${(lead.initial_interest_notes || '').replace(/"/g, '""')}"`,
          `"${lead.website || ''}"`,
          `"${lead.created_at || ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} leads`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    importCsv,
    exportCsv,
    isImporting,
    isExporting
  };
}
