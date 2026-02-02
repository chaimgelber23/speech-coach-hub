'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
} from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  time: string;
}

const eventTypeColors: Record<string, string> = {
  shiur: 'bg-blue-500',
  chavrusa: 'bg-green-500',
  meeting: 'bg-orange-500',
  practice: 'bg-purple-500',
  personal: 'bg-gray-500',
};

const demoEvents: Event[] = [
  { id: '1', title: 'Chavrusa - Kiddush', date: new Date(2026, 1, 2), type: 'chavrusa', time: '7:00 PM' },
  { id: '2', title: 'Weekly Shiur', date: new Date(2026, 1, 5), type: 'shiur', time: '8:00 PM' },
  { id: '3', title: 'Speech Practice', date: new Date(2026, 1, 3), type: 'practice', time: '9:00 AM' },
  { id: '4', title: 'Chavrusa - Shabbos Candles', date: new Date(2026, 1, 9), type: 'chavrusa', time: '7:00 PM' },
  { id: '5', title: 'Parsha Shiur', date: new Date(2026, 1, 12), type: 'shiur', time: '8:00 PM' },
  { id: '6', title: 'Beshalach Delivery', date: new Date(2026, 1, 8), type: 'shiur', time: '10:00 AM' },
];

export default function CalendarPage() {
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

  const selectedEvents = selectedDate
    ? demoEvents.filter((e) => isSameDay(e.date, selectedDate))
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Calendar"
        description="Your events and schedule"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Add Event
          </Button>
        }
      />

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
                const dayEvents = demoEvents.filter((e) => isSameDay(e.date, d));
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
                            eventTypeColors[e.type] || 'bg-gray-500'
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
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${eventTypeColors[e.type]}`} />
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-slate-500">{e.time}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {e.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
