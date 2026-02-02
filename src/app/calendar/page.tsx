'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { useEvents } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

const eventTypeColors: Record<string, string> = {
  shiur: 'bg-blue-500',
  chavrusa: 'bg-green-500',
  meeting: 'bg-orange-500',
  practice: 'bg-purple-500',
  personal: 'bg-gray-500',
};

export default function CalendarPage() {
  const { events, loading, addEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  function getEventDate(e: { start_time: string }): Date {
    try { return parseISO(e.start_time); } catch { return new Date(0); }
  }

  const selectedEvents = selectedDate
    ? events.filter((e) => isSameDay(getEventDate(e), selectedDate))
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Calendar"
        description="Your events and schedule"
        action={
          <AddDialog
            title="Add Event"
            buttonLabel="Add Event"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Event title' },
              { name: 'start_time', label: 'Start', type: 'datetime-local', required: true },
              { name: 'end_time', label: 'End', type: 'datetime-local' },
              {
                name: 'event_type',
                label: 'Type',
                type: 'select',
                options: [
                  { value: 'shiur', label: 'Shiur' },
                  { value: 'chavrusa', label: 'Chavrusa' },
                  { value: 'meeting', label: 'Meeting' },
                  { value: 'practice', label: 'Practice' },
                  { value: 'personal', label: 'Personal' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              return addEvent(values.title, values.start_time, values.end_time || undefined, values.event_type || undefined);
            }}
          />
        }
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <h2 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shb'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-px bg-slate-200 rounded overflow-hidden">
                {days.map((d, i) => {
                  const dayEvents = events.filter((e) => isSameDay(getEventDate(e), d));
                  const isSelected = selectedDate && isSameDay(d, selectedDate);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`bg-white min-h-[80px] p-1.5 cursor-pointer transition-colors
                        ${!isSameMonth(d, monthStart) ? 'bg-slate-50 text-slate-300' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                        ${isToday(d) ? 'bg-blue-50' : ''}
                        hover:bg-slate-100
                      `}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday(d)
                            ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center'
                            : ''
                        }`}
                      >
                        {format(d, 'd')}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={`text-xs text-white px-1 py-0.5 rounded truncate ${
                              eventTypeColors[e.event_type || ''] || 'bg-gray-500'
                            }`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-slate-400">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a day'}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-400">No events</p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((e) => (
                    <div key={e.id} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${eventTypeColors[e.event_type || ''] || 'bg-gray-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-slate-500">
                          {format(parseISO(e.start_time), 'h:mm a')}
                          {e.end_time && ` – ${format(parseISO(e.end_time), 'h:mm a')}`}
                        </p>
                        {e.event_type && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {e.event_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
