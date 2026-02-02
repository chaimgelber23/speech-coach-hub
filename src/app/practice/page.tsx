'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mic, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface PracticeEntry {
  id: string;
  title: string;
  date: string;
  duration: number;
  type: string;
  vocal: number;
  vitality: number;
  visual: number;
  notes: string;
}

const demoLogs: PracticeEntry[] = [
  {
    id: '1',
    title: 'Beshalach Speech',
    date: '2026-02-01',
    duration: 25,
    type: 'table_read',
    vocal: 3,
    vitality: 2,
    visual: 2,
    notes: 'First run-through. Need to work on energy levels. Transition from section 2 to 3 was rough.',
  },
  {
    id: '2',
    title: 'Kiddush Teaching',
    date: '2026-01-30',
    duration: 40,
    type: 'rehearsal',
    vocal: 4,
    vitality: 3,
    visual: 3,
    notes: 'Better flow this time. Questions feel more natural. Need to slow down in halachos section.',
  },
  {
    id: '3',
    title: 'Beshalach Speech',
    date: '2026-01-28',
    duration: 15,
    type: 'table_read',
    vocal: 2,
    vitality: 2,
    visual: 1,
    notes: 'Initial read. Identified sections that are too long. Need to cut the second proof point.',
  },
];

const typeLabels: Record<string, string> = {
  table_read: 'Table Read',
  block: 'Block Movements',
  rehearsal: 'Rehearsal',
  dress: 'Dress Rehearsal',
};

function PillarBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-14">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-5 h-2 rounded-sm ${
              i <= value ? 'bg-blue-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{value}/5</span>
    </div>
  );
}

export default function PracticePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Practice Log"
        description="Track your rehearsals — Vocal, Vitality, Visual (Eliezer Blatt)"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> Log Practice
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">{demoLogs.length}</p>
            <p className="text-xs text-slate-500">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">
              {demoLogs.reduce((sum, l) => sum + l.duration, 0)}
            </p>
            <p className="text-xs text-slate-500">Total Minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">
              {(
                demoLogs.reduce((sum, l) => sum + l.vocal + l.vitality + l.visual, 0) /
                (demoLogs.length * 3)
              ).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Practice Log Entries */}
      <div className="space-y-3">
        {demoLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Mic size={14} className="text-purple-500" />
                    {log.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{log.date}</span>
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[log.type] || log.type}
                    </Badge>
                    <span className="text-xs text-slate-400">{log.duration} min</span>
                  </div>
                </div>
              </div>

              {/* Pillar Ratings */}
              <div className="space-y-1 mb-3">
                <PillarBar label="Vocal" value={log.vocal} />
                <PillarBar label="Vitality" value={log.vitality} />
                <PillarBar label="Visual" value={log.visual} />
              </div>

              <p className="text-xs text-slate-600 border-t pt-2">{log.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
