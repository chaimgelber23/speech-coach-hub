'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Square, Save, Timer } from 'lucide-react';
import { usePracticeLogs } from '@/lib/hooks';

interface PracticeTimerProps {
  pipelineId?: string;
  onSaved?: () => void;
}

export default function PracticeTimer({ pipelineId, onSaved }: PracticeTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [finished, setFinished] = useState(false);
  const [vocalRating, setVocalRating] = useState(0);
  const [vitalityRating, setVitalityRating] = useState(0);
  const [visualRating, setVisualRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addLog } = usePracticeLogs();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleStart() {
    setRunning(true);
    setFinished(false);
  }

  function handlePause() {
    setRunning(false);
  }

  function handleStop() {
    setRunning(false);
    setFinished(true);
  }

  function handleReset() {
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setVocalRating(0);
    setVitalityRating(0);
    setVisualRating(0);
    setNotes('');
  }

  async function handleSave() {
    setSaving(true);
    await addLog({
      pipeline_id: pipelineId || null,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: Math.round(elapsed / 60),
      practice_type: 'rehearsal',
      vocal_rating: vocalRating || null,
      vitality_rating: vitalityRating || null,
      visual_rating: visualRating || null,
      notes: notes || null,
    });
    setSaving(false);
    handleReset();
    onSaved?.();
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-16">{label}</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
              value >= n
                ? 'bg-purple-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Timer size={16} className="text-purple-500" />
          <h3 className="text-sm font-semibold">Practice Timer</h3>
        </div>

        {/* Timer display */}
        <div className="text-center mb-4">
          <p className={`text-4xl font-mono font-bold ${running ? 'text-purple-600' : 'text-slate-700'}`}>
            {timeDisplay}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 mb-4">
          {!running && !finished && (
            <Button onClick={handleStart} className="bg-purple-600 hover:bg-purple-700">
              <Play size={14} className="mr-1" /> {elapsed > 0 ? 'Resume' : 'Start'}
            </Button>
          )}
          {running && (
            <>
              <Button onClick={handlePause} variant="outline">
                <Pause size={14} className="mr-1" /> Pause
              </Button>
              <Button onClick={handleStop} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Square size={14} className="mr-1" /> Stop
              </Button>
            </>
          )}
          {finished && (
            <Button onClick={handleReset} variant="ghost" size="sm">
              Reset
            </Button>
          )}
        </div>

        {/* Rating section (shown after stop) */}
        {finished && elapsed > 0 && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Rate your practice ({minutes} min)
            </p>
            <RatingRow label="Vocal" value={vocalRating} onChange={setVocalRating} />
            <RatingRow label="Vitality" value={vitalityRating} onChange={setVitalityRating} />
            <RatingRow label="Visual" value={visualRating} onChange={setVisualRating} />
            <div>
              <Label className="text-xs text-slate-500">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What to improve next time..."
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save size={14} className="mr-1" />
                {saving ? 'Saving...' : 'Save Practice'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
