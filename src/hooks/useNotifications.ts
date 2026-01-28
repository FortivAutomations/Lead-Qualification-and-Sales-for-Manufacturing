import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  companyName: string;
  timestamp: Date;
  read: boolean;
  leadId: string;
}

const STORAGE_KEY = 'lead_notifications';
const MAX_NOTIFICATIONS = 10;

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    }
  } catch (e) {
    console.error('Failed to load notifications:', e);
  }
  return [];
}

function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((leadId: string, companyName: string) => {
    setNotifications((prev) => {
      // Check if already exists
      if (prev.some((n) => n.leadId === leadId)) {
        return prev;
      }

      const newNotification: Notification = {
        id: crypto.randomUUID(),
        leadId,
        companyName: companyName || 'Unknown Company',
        timestamp: new Date(),
        read: false,
      };

      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  // Subscribe to real-time changes on incoming_leads
  useEffect(() => {
    const channel = supabase
      .channel('notifications-incoming-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_leads',
        },
        (payload) => {
          console.log('[Notifications] New lead received:', payload.new);
          const newLead = payload.new as { id: string; company_name: string };
          addNotification(newLead.id, newLead.company_name);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
          queryClient.invalidateQueries({ queryKey: ['lead-volume'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification, queryClient]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
