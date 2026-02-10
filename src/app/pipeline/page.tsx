'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, ExternalLink } from 'lucide-react';
import { usePipeline } from '@/lib/hooks';
import { PIPELINE_STAGES } from '@/types';
import AddDialog from '@/components/AddDialog';
import Link from 'next/link';

export default function PipelinePage() {
  const { items, loading, addItem, updateStage } = usePipeline();

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDrop(e: React.DragEvent, stage: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) updateStage(id, stage as typeof items[0]['stage']);
  }

  return (
    <div className="max-w-full mx-auto">
      <Header
        title="Content Pipeline"
        description="Track your content from idea to delivery"
        action={
          <AddDialog
            title="New Pipeline Item"
            buttonLabel="New Item"
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Shabbos Candles Teaching' },
              {
                name: 'content_type',
                label: 'Type',
                type: 'select',
                options: [
                  { value: 'speech', label: 'Speech' },
                  { value: 'shiur', label: 'Shiur' },
                  { value: 'chavrusa', label: 'Chavrusa' },
                  { value: 'course', label: 'Course' },
                ],
              },
            ]}
            onSubmit={async (values) => {
              return addItem(values.title, values.content_type || 'speech');
            }}
          />
        }
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = items.filter((item) => item.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="min-w-[220px] flex-1"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <div className={`rounded-lg p-3 ${stage.color} min-h-[400px]`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
                    <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded">{stageItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageItems.map((item) => {
                      const cardContent = (
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium truncate">{item.title}</p>
                                {item.document_slug && (
                                  <ExternalLink size={12} className="text-slate-400 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {item.content_type && (
                                  <Badge variant="outline" className="text-xs">{item.content_type}</Badge>
                                )}
                                {item.target_date && (
                                  <span className="text-xs text-slate-500">{item.target_date}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      );

                      return item.document_slug ? (
                        <Link key={item.id} href={`/research/${item.document_slug}`}>
                          <Card
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                          >
                            {cardContent}
                          </Card>
                        </Link>
                      ) : (
                        <Card
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="cursor-grab active:cursor-grabbing shadow-sm"
                        >
                          {cardContent}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
