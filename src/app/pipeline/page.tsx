'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { PIPELINE_STAGES } from '@/types';

interface PipelineCard {
  id: string;
  title: string;
  content_type: string;
  stage: string;
  target_date: string | null;
}

const demoItems: PipelineCard[] = [
  { id: '1', title: 'Kiddush Friday Night', content_type: 'chavrusa', stage: 'practice', target_date: '2026-02-05' },
  { id: '2', title: 'Shabbos Candles', content_type: 'chavrusa', stage: 'research', target_date: null },
  { id: '3', title: 'Beshalach Speech', content_type: 'speech', stage: 'draft', target_date: '2026-02-08' },
  { id: '4', title: 'Tefillin', content_type: 'chavrusa', stage: 'research', target_date: null },
  { id: '5', title: 'Why Suffering?', content_type: 'shiur', stage: 'idea', target_date: null },
  { id: '6', title: 'Afterlife Course', content_type: 'course', stage: 'research', target_date: null },
  { id: '7', title: 'Tzitzis', content_type: 'chavrusa', stage: 'research', target_date: null },
];

export default function PipelinePage() {
  const [items, setItems] = useState(demoItems);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDraggedItem(id);
  }

  function handleDrop(stage: string) {
    if (draggedItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggedItem ? { ...item, stage } : item
        )
      );
      setDraggedItem(null);
    }
  }

  return (
    <div className="max-w-full mx-auto">
      <Header
        title="Content Pipeline"
        description="Track your content from idea to delivery"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> New Item
          </Button>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageItems = items.filter((item) => item.stage === stage.key);
          return (
            <div
              key={stage.key}
              className="min-w-[220px] flex-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className={`rounded-lg p-3 ${stage.color} min-h-[400px]`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {stage.label}
                  </h3>
                  <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {stageItems.map((item) => (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      className="cursor-grab active:cursor-grabbing shadow-sm"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.content_type}
                              </Badge>
                              {item.target_date && (
                                <span className="text-xs text-slate-500">
                                  {item.target_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
