'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SCHEDULE_COLORS } from '@/types';
import { useScheduleBlocks } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

const hours = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, '0')}:00`;
});

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];

export default function SchedulePage() {
  const { blocks, loading, addBlock, deleteBlock } = useScheduleBlocks();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  // Filter blocks for selected day (match day_of_week or null for daily)
  const dayBlocks = blocks.filter(
    (b) => b.day_of_week === null || b.day_of_week === selectedDay
  );

  function getBlockPosition(start: string, end: string) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = (startH - 6) * 60 + startM;
    const endMinutes = (endH - 6) * 60 + endM;
    return {
      top: (startMinutes / 60) * 60,
      height: Math.max(((endMinutes - startMinutes) / 60) * 60, 20),
    };
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Daily Schedule"
        description="Plan your day — allocate time blocks to activities"
        action={
          <AddDialog
            title="Add Time Block"
            buttonLabel="Add Block"
            fields={[
              { name: 'activity', label: 'Activity', type: 'text', required: true, placeholder: 'e.g. Torah Learning' },
              { name: 'start_time', label: 'Start Time', type: 'time', required: true },
              { name: 'end_time', label: 'End Time', type: 'time', required: true },
              {
                name: 'category',
                label: 'Category',
                type: 'select',
                options: [
                  { value: 'learning', label: 'Learning' },
                  { value: 'prep', label: 'Prep' },
                  { value: 'practice', label: 'Practice' },
                  { value: 'personal', label: 'Personal' },
                  { value: 'work', label: 'Work' },
                ],
              },
              {
                name: 'day_of_week',
                label: 'Day',
                type: 'select',
                options: [
                  { value: 'daily', label: 'Every Day' },
                  { value: '0', label: 'Sunday' },
                  { value: '1', label: 'Monday' },
                  { value: '2', label: 'Tuesday' },
                  { value: '3', label: 'Wednesday' },
                  { value: '4', label: 'Thursday' },
                  { value: '5', label: 'Friday' },
                  { value: '6', label: 'Shabbos' },
                ],
              },
              { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes...' },
            ]}
            onSubmit={async (values) => {
              return addBlock({
                day_of_week: values.day_of_week === 'daily' ? null : parseInt(values.day_of_week),
                start_time: values.start_time,
                end_time: values.end_time,
                activity: values.activity,
                category: values.category || null,
                notes: values.notes || null,
              });
            }}
          />
        }
      />

      {/* Day Selector */}
      <div className="flex gap-1 mb-6">
        {dayNames.map((day, i) => (
          <Button
            key={day}
            variant={selectedDay === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDay(i)}
            className="flex-1"
          >
            {day.slice(0, 3)}
          </Button>
        ))}
      </div>

      {/* Category Legend */}
      <div className="flex gap-3 mb-4">
        {Object.entries(SCHEDULE_COLORS).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${colors.split(' ')[0]}`} />
            <span className="text-xs text-slate-600 capitalize">{cat}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="relative" style={{ height: `${18 * 60}px` }}>
              {/* Time labels */}
              {hours.map((hour, i) => (
                <div
                  key={hour}
                  className="absolute left-0 w-14 text-xs text-slate-400 -translate-y-1/2"
                  style={{ top: `${i * 60}px` }}
                >
                  {hour}
                </div>
              ))}

              {/* Grid lines */}
              {hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-16 right-0 border-t border-slate-100"
                  style={{ top: `${i * 60}px` }}
                />
              ))}

              {/* Time blocks */}
              {dayBlocks.map((block) => {
                const pos = getBlockPosition(block.start_time, block.end_time);
                const colorClass = SCHEDULE_COLORS[block.category || 'work'] || SCHEDULE_COLORS.work;
                return (
                  <div
                    key={block.id}
                    className={`absolute left-18 right-2 rounded-md border-l-4 px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity group ${colorClass}`}
                    style={{ top: `${pos.top}px`, height: `${pos.height}px` }}
                  >
                    <p className="text-xs font-medium truncate">{block.activity}</p>
                    <p className="text-xs text-slate-500">
                      {block.start_time} - {block.end_time}
                    </p>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="absolute top-1 right-1 text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600"
                      title="Remove block"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
