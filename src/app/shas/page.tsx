'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, BookOpen } from 'lucide-react';
import { useShasMasechtos, useShasCompletions } from '@/lib/hooks';
import { SEDER_CONFIG, type CompletionType } from '@/types';
import { cn } from '@/lib/utils';

export default function ShasTrackerPage() {
  const { data: masechtos, loading: masechtosLoading } = useShasMasechtos();
  const { completions, loading: completionsLoading, toggleCompletion } = useShasCompletions();

  const loading = masechtosLoading || completionsLoading;

  const completionKeys = new Set(
    completions.map((c) => `${c.masechta_id}-${c.completion_type}`)
  );

  function isCompleted(masechtaId: string, type: CompletionType) {
    return completionKeys.has(`${masechtaId}-${type}`);
  }

  const gemaraMasechtos = masechtos.filter((m) => m.has_bavli);

  function getStats(list: typeof masechtos, type: CompletionType) {
    const total = list.length;
    const completed = list.filter((m) => isCompleted(m.id, type)).length;
    const totalUnits = type === 'gemara'
      ? list.reduce((sum, m) => sum + (m.daf_count || 0), 0)
      : list.reduce((sum, m) => sum + m.perakim, 0);
    const completedUnits = list
      .filter((m) => isCompleted(m.id, type))
      .reduce((sum, m) => sum + (type === 'gemara' ? (m.daf_count || 0) : m.perakim), 0);
    return { total, completed, totalUnits, completedUnits };
  }

  function renderShasMap(type: CompletionType) {
    const activeMasechtos = type === 'gemara' ? gemaraMasechtos : masechtos;
    const stats = getStats(activeMasechtos, type);
    const unitLabel = type === 'gemara' ? 'daf' : 'perakim';

    const sederGroups = SEDER_CONFIG.map((seder) => {
      const sederMasechtos = activeMasechtos.filter((m) => m.seder === seder.key);
      if (sederMasechtos.length === 0) return null;
      const sederStats = getStats(sederMasechtos, type);
      return { ...seder, masechtos: sederMasechtos, ...sederStats };
    }).filter(Boolean);

    return (
      <>
        {/* Overall Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                {type === 'gemara'
                  ? <Library size={16} className="text-blue-500" />
                  : <BookOpen size={16} className="text-emerald-500" />
                }
                Overall Progress
              </h3>
              <span className="text-sm text-slate-500">
                {stats.completed}/{stats.total} masechtos
                {' \u00b7 '}
                {stats.completedUnits.toLocaleString()}/{stats.totalUnits.toLocaleString()} {unitLabel}
              </span>
            </div>
            <Progress
              value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
              className="h-2.5"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {stats.totalUnits > 0 ? Math.round((stats.completedUnits / stats.totalUnits) * 100) : 0}% of {unitLabel} completed
            </p>
          </CardContent>
        </Card>

        {/* Seder Sections */}
        <div className="space-y-6">
          {sederGroups.map((seder) => {
            if (!seder) return null;
            return (
              <Card key={seder.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className={cn('text-xs', seder.color)}>
                        {seder.label}
                      </Badge>
                      <span className="text-sm font-normal text-slate-500">
                        {seder.total} masechtos
                      </span>
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      {seder.completed}/{seder.total} learned
                      {' \u00b7 '}
                      {seder.completedUnits}/{seder.totalUnits} {unitLabel}
                    </span>
                  </div>
                  <Progress
                    value={seder.total > 0 ? (seder.completed / seder.total) * 100 : 0}
                    className="h-1.5"
                  />
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Table header */}
                  <div className={cn(
                    'grid items-center gap-x-3 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100',
                    type === 'gemara'
                      ? 'grid-cols-[auto_1fr_80px_80px_80px]'
                      : 'grid-cols-[auto_1fr_80px_80px]'
                  )}>
                    <div className="w-5" />
                    <div>Masechta</div>
                    <div className="text-center">Perakim</div>
                    {type === 'gemara' && <div className="text-center">Daf</div>}
                    <div className="text-center">Status</div>
                  </div>

                  {/* Masechta rows */}
                  {seder.masechtos.map((masechta) => {
                    const done = isCompleted(masechta.id, type);
                    return (
                      <button
                        key={masechta.id}
                        onClick={() => toggleCompletion(masechta.id, type)}
                        className={cn(
                          'grid w-full text-left cursor-pointer transition-colors',
                          type === 'gemara'
                            ? 'grid-cols-[auto_1fr_80px_80px_80px]'
                            : 'grid-cols-[auto_1fr_80px_80px]',
                          'items-center gap-x-3 px-3 py-2.5 rounded-lg',
                          done
                            ? 'bg-green-50 hover:bg-green-100'
                            : 'hover:bg-slate-50'
                        )}
                      >
                        <Checkbox
                          checked={done}
                          className="pointer-events-none"
                        />
                        <span className={cn(
                          'text-sm font-medium',
                          done ? 'text-green-800' : 'text-slate-800'
                        )}>
                          {masechta.name}
                        </span>
                        <span className={cn(
                          'text-sm text-center tabular-nums',
                          done ? 'text-green-600' : 'text-slate-500'
                        )}>
                          {masechta.perakim}
                        </span>
                        {type === 'gemara' && (
                          <span className={cn(
                            'text-sm text-center tabular-nums',
                            done ? 'text-green-600' : 'text-slate-500'
                          )}>
                            {masechta.daf_count}
                          </span>
                        )}
                        <div className="flex justify-center">
                          {done ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Learned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 text-xs">
                              &mdash;
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Header
        title="Shas Tracker"
        description="Track your progress through Gemara and Mishnayos"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <Tabs defaultValue="gemara">
          <TabsList className="mb-6">
            <TabsTrigger value="gemara">Gemara ({gemaraMasechtos.length} masechtos)</TabsTrigger>
            <TabsTrigger value="mishnayos">Mishnayos ({masechtos.length} masechtos)</TabsTrigger>
          </TabsList>
          <TabsContent value="gemara">
            {renderShasMap('gemara')}
          </TabsContent>
          <TabsContent value="mishnayos">
            {renderShasMap('mishnayos')}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
