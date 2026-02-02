'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      setEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000);
    // Also check immediately
    checkReminders();

    return () => clearInterval(interval);
  }, [enabled]);

  async function requestPermission() {
    if (!('Notification' in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    setEnabled(result === 'granted');

    if (result === 'granted') {
      new Notification('Speech Coach Hub', {
        body: 'Notifications enabled! You\'ll get daily reminders for your rituals and upcoming events.',
        icon: '/favicon.ico',
      });
    }
  }

  async function checkReminders() {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    // Morning reminder at 7:00 AM — check rituals
    if (currentHour === 7 && currentMinute === 0) {
      const { data: rituals } = await supabase
        .from('rituals')
        .select('*')
        .eq('active', true);

      const { data: completions } = await supabase
        .from('ritual_completions')
        .select('*')
        .eq('completed_date', todayStr);

      const completedIds = new Set((completions || []).map((c: { ritual_id: string }) => c.ritual_id));
      const pending = (rituals || []).filter((r: { id: string }) => !completedIds.has(r.id));

      if (pending.length > 0) {
        new Notification('Good Morning!', {
          body: `You have ${pending.length} ritual${pending.length > 1 ? 's' : ''} to complete today.`,
          icon: '/favicon.ico',
        });
      }
    }

    // Evening reminder at 9:00 PM — check incomplete rituals
    if (currentHour === 21 && currentMinute === 0) {
      const { data: rituals } = await supabase
        .from('rituals')
        .select('*')
        .eq('active', true);

      const { data: completions } = await supabase
        .from('ritual_completions')
        .select('*')
        .eq('completed_date', todayStr);

      const completedIds = new Set((completions || []).map((c: { ritual_id: string }) => c.ritual_id));
      const pending = (rituals || []).filter((r: { id: string }) => !completedIds.has(r.id));

      if (pending.length > 0) {
        new Notification('Evening Check-in', {
          body: `${pending.length} ritual${pending.length > 1 ? 's' : ''} still incomplete today. Don't forget!`,
          icon: '/favicon.ico',
        });
      }
    }

    // Check for upcoming events (15 min before)
    const fifteenMinsLater = new Date(now.getTime() + 15 * 60000);
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', now.toISOString())
      .lte('start_time', fifteenMinsLater.toISOString());

    if (events && events.length > 0) {
      for (const event of events) {
        new Notification(`Coming up: ${event.title}`, {
          body: `Starts at ${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          icon: '/favicon.ico',
        });
      }
    }

    // Check for tasks due today
    if (currentHour === 8 && currentMinute === 0) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('due_date', todayStr)
        .neq('status', 'done');

      if (tasks && tasks.length > 0) {
        new Notification('Tasks Due Today', {
          body: `${tasks.length} task${tasks.length > 1 ? 's' : ''} due today: ${tasks.map((t: { title: string }) => t.title).join(', ')}`,
          icon: '/favicon.ico',
        });
      }
    }
  }

  if (permission === 'denied') return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={enabled ? () => setEnabled(false) : requestPermission}
      className="text-slate-400 hover:text-slate-200"
      title={enabled ? 'Notifications on' : 'Enable notifications'}
    >
      {enabled ? <Bell size={16} /> : <BellOff size={16} />}
    </Button>
  );
}
