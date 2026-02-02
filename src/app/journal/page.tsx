'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpenCheck, Star } from 'lucide-react';

const demoEntries = [
  {
    id: '1',
    title: 'Kiddush Chavrusa - Session 1',
    date: '2026-01-28',
    audience: 'David - one-on-one chavrusa',
    what_landed: 'The opening question about wine really grabbed him. He loved the machlokes about cup sizes — made it feel real and alive. The connection between Zachor and verbal sanctification clicked.',
    what_didnt: 'Went too fast through the halachos section. He seemed lost when I jumped to mevushal wine. Should have kept it simpler.',
    reactions: 'Asked great follow-up questions. Wanted to know more about the Kabbalistic reasons. Said he\'d never thought about what the words of Kiddush actually mean.',
    rating: 4,
    lessons: 'Slow down on halachos. Let the learner digest each piece before moving on. The questions are working well — keep that approach.',
  },
  {
    id: '2',
    title: 'Beshalach Parsha Shiur',
    date: '2026-01-25',
    audience: '~15 people at Shabbos morning shiur',
    what_landed: 'The hook about Pharaoh sending vs. chasing worked well. People were engaged through the Maharal section. The personal story about leaving comfort zones resonated.',
    what_didnt: 'Lost them during the Ramban explanation. Too technical. The ending felt rushed — ran out of time.',
    reactions: 'Two people came up afterward to continue the conversation. One said it changed how he sees the Parsha.',
    rating: 3,
    lessons: 'Time management — cut one proof point. The Ramban needs to be simplified. Personal stories are the strongest part. Ending needs to be planned better.',
  },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= value ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function JournalPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="Delivery Journal"
        description="Reflect on what you delivered — what worked, what to improve"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1" /> New Entry
          </Button>
        }
      />

      <div className="space-y-4">
        {demoEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <BookOpenCheck size={16} className="text-green-500" />
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{entry.date}</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.audience}
                    </Badge>
                  </div>
                </div>
                <StarRating value={entry.rating} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-green-700 uppercase mb-1">
                    What Landed
                  </h4>
                  <p className="text-slate-600">{entry.what_landed}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-red-700 uppercase mb-1">
                    What Didn&apos;t
                  </h4>
                  <p className="text-slate-600">{entry.what_didnt}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-blue-700 uppercase mb-1">
                    Audience Reactions
                  </h4>
                  <p className="text-slate-600">{entry.reactions}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">
                    Lessons Learned
                  </h4>
                  <p className="text-slate-600">{entry.lessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
