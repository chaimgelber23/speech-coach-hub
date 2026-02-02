'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic } from 'lucide-react';
import { usePracticeLogs } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

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
          <div key={i} className={`w-5 h-2 rounded-sm ${i <= value ? 'bg-blue-500' : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="text-xs text-slate-400">{value}/5</span>
    </div>
  );
}

export default function PracticePage() {
  const { logs, loading, addLog } = usePracticeLogs();

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const avgRating = logs.length > 0
    ? (logs.reduce((sum, l) => sum + (l.vocal_rating || 0) + (l.vitality_rating || 0) + (l.visual_rating || 0), 0) / (logs.length * 3)).toFixed(1)
    : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Practice Log"
        description="Track your rehearsals — Vocal, Vitality, Visual (Eliezer Blatt)"
        action={
          <AddDialog
            title="Log Practice Session"
            buttonLabel="Log Practice"
            fields={[
              { name: 'date', label: 'Date', type: 'date', required: true },
              { name: 'duration_minutes', label: 'Duration (minutes)', type: 'text', required: true, placeholder: '30' },
              {
                name: 'practice_type', label: 'Type', type: 'select',
                options: [
                  { value: 'table_read', label: 'Table Read' },
                  { value: 'block', label: 'Block Movements' },
                  { value: 'rehearsal', label: 'Rehearsal' },
                  { value: 'dress', label: 'Dress Rehearsal' },
                ],
              },
              { name: 'vocal_rating', label: 'Vocal (1-5)', type: 'text', placeholder: '3' },
              { name: 'vitality_rating', label: 'Vitality (1-5)', type: 'text', placeholder: '3' },
              { name: 'visual_rating', label: 'Visual (1-5)', type: 'text', placeholder: '3' },
              { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'What went well? What to improve?' },
            ]}
            onSubmit={async (values) => {
              return addLog({
                date: values.date,
                duration_minutes: parseInt(values.duration_minutes) || 0,
                practice_type: values.practice_type || 'table_read',
                vocal_rating: parseInt(values.vocal_rating) || 3,
                vitality_rating: parseInt(values.vitality_rating) || 3,
                visual_rating: parseInt(values.visual_rating) || 3,
                notes: values.notes || null,
                pipeline_id: null,
              });
            }}
          />
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-700">{logs.length}</p><p className="text-xs text-slate-500">Total Sessions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-700">{totalMinutes}</p><p className="text-xs text-slate-500">Total Minutes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-700">{avgRating}</p><p className="text-xs text-slate-500">Avg Rating</p></CardContent></Card>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-400">No practice sessions yet. Click &quot;Log Practice&quot; to add one.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Mic size={14} className="text-purple-500" />
                      Practice Session
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{log.date}</span>
                      <Badge variant="outline" className="text-xs">{typeLabels[log.practice_type || ''] || log.practice_type}</Badge>
                      <span className="text-xs text-slate-400">{log.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <PillarBar label="Vocal" value={log.vocal_rating || 0} />
                  <PillarBar label="Vitality" value={log.vitality_rating || 0} />
                  <PillarBar label="Visual" value={log.visual_rating || 0} />
                </div>
                {log.notes && <p className="text-xs text-slate-600 border-t pt-2">{log.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
