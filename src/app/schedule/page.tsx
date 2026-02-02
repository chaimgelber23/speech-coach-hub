'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { SCHEDULE_COLORS } from '@/types';

interface TimeBlock {
  id: string;
  start: string;
  end: string;
  activity: string;
  category: string;
}

const hours = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, '0')}:00`;
});

const demoBlocks: TimeBlock[] = [
  { id: '1', start: '06:00', end: '06:30', activity: 'Morning Meditation', category: 'personal' },
  { id: '2', start: '06:30', end: '07:30', activity: 'Davening', category: 'personal' },
  { id: '3', start: '07:30', end: '08:00', activity: 'Breakfast', category: 'personal' },
  { id: '4', start: '08:00', end: '09:00', activity: 'Torah Learning', category: 'learning' },
  { id: '5', start: '09:00', end: '12:00', activity: 'Work', category: 'work' },
  { id: '6', start: '13:00', end: '14:00', activity: 'Shiur Prep', category: 'prep' },
  { id: '7', start: '14:00', end: '17:00', activity: 'Work', category: 'work' },
  { id: '8', start: '19:00', end: '20:00', activity: 'Chavrusa', category: 'learning' },
  { id: '9', start: '20:00', end: '20:30', activity: 'Practice Delivery', category: 'practice' },
  { id: '10', start: '21:00', end: '21:30', activity: 'Evening Reflection', category: 'personal' },
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];

export default function SchedulePage() {
  const [blocks, setBlocks] = useState(demoBlocks);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

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
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Save size={16} className="mr-1" /> Save Template
            </Button>
            <Button size="sm">
              <Plus size={16} className="mr-1" /> Add Block
            </Button>
          </div>
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

      {/* Schedule Grid */}
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
            {blocks.map((block) => {
              const pos = getBlockPosition(block.start, block.end);
              const colorClass = SCHEDULE_COLORS[block.category] || SCHEDULE_COLORS.work;
              return (
                <div
                  key={block.id}
                  className={`absolute left-18 right-2 rounded-md border-l-4 px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
                  style={{ top: `${pos.top}px`, height: `${pos.height}px` }}
                >
                  <p className="text-xs font-medium truncate">{block.activity}</p>
                  <p className="text-xs text-slate-500">
                    {block.start} - {block.end}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
