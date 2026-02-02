'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpenCheck, Star } from 'lucide-react';
import { useDeliveryJournal } from '@/lib/hooks';
import AddDialog from '@/components/AddDialog';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= value ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'} />
      ))}
    </div>
  );
}

export default function JournalPage() {
  const { entries, loading, addEntry } = useDeliveryJournal();

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Delivery Journal"
        description="Reflect on what you delivered — what worked, what to improve"
        action={
          <AddDialog
            title="New Journal Entry"
            buttonLabel="New Entry"
            fields={[
              { name: 'date', label: 'Date', type: 'date', required: true },
              { name: 'audience_description', label: 'Audience', type: 'text', placeholder: 'Who was there?' },
              { name: 'what_landed', label: 'What Landed', type: 'textarea', placeholder: 'What worked well?' },
              { name: 'what_didnt', label: 'What Didn\'t', type: 'textarea', placeholder: 'What fell flat?' },
              { name: 'audience_reactions', label: 'Audience Reactions', type: 'textarea', placeholder: 'How did they respond?' },
              { name: 'overall_rating', label: 'Overall Rating (1-5)', type: 'text', placeholder: '4' },
              { name: 'lessons_learned', label: 'Lessons Learned', type: 'textarea', placeholder: 'What will you do differently?' },
            ]}
            onSubmit={async (values) => {
              return addEntry({
                date: values.date,
                audience_description: values.audience_description || null,
                what_landed: values.what_landed || null,
                what_didnt: values.what_didnt || null,
                audience_reactions: values.audience_reactions || null,
                overall_rating: parseInt(values.overall_rating) || 3,
                lessons_learned: values.lessons_learned || null,
                pipeline_id: null,
              });
            }}
          />
        }
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">No journal entries yet. Click &quot;New Entry&quot; after your next delivery.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <BookOpenCheck size={16} className="text-green-500" />
                      Delivery
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{entry.date}</span>
                      {entry.audience_description && (
                        <Badge variant="outline" className="text-xs">{entry.audience_description}</Badge>
                      )}
                    </div>
                  </div>
                  <StarRating value={entry.overall_rating || 0} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {entry.what_landed && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-700 uppercase mb-1">What Landed</h4>
                      <p className="text-slate-600">{entry.what_landed}</p>
                    </div>
                  )}
                  {entry.what_didnt && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-700 uppercase mb-1">What Didn&apos;t</h4>
                      <p className="text-slate-600">{entry.what_didnt}</p>
                    </div>
                  )}
                  {entry.audience_reactions && (
                    <div>
                      <h4 className="text-xs font-semibold text-blue-700 uppercase mb-1">Audience Reactions</h4>
                      <p className="text-slate-600">{entry.audience_reactions}</p>
                    </div>
                  )}
                  {entry.lessons_learned && (
                    <div>
                      <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Lessons Learned</h4>
                      <p className="text-slate-600">{entry.lessons_learned}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
