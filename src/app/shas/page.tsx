'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, CheckCircle2, BookOpen } from 'lucide-react';
import { useShasMasechtos, useShasCompletions } from '@/lib/hooks';
import { SEDER_CONFIG, type CompletionType } from '@/types';
import { cn } from '@/lib/utils';

export default function ShasTrackerPage() {
  const { data: masechtos, loading: masechtosLoading } = useShasMasechtos();
  const { completions, loading: completionsLoading, toggleCompletion } = useShasCompletions();

  const loading = masechtosLoading || completionsLoading;

  // Build completion lookup: Set of "masechtaId-type" strings
  const completionKeys = new Set(
    completions.map((c) => `${c.masechta_id}-${c.completion_type}`)
  );

  function isCompleted(masechtaId: string, type: CompletionType) {
    return completionKeys.has(`${masechtaId}-${type}`);
  }

  // Gemara masechtos (37 with Bavli)
  const gemaraMasechtos = masechtos.filter((m) => m.has_bavli);

  // Stats helper
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
        {/* Overall Progress Card */}
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
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      {seder.completed}/{seder.total} masechtos
                      {' \u00b7 '}
                      {seder.completedUnits}/{seder.totalUnits} {unitLabel}
                    </span>
                  </div>
                  <Progress
                    value={seder.total > 0 ? (seder.completed / seder.total) * 100 : 0}
                    className="h-1.5"
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {seder.masechtos.map((masechta) => {
                      const done = isCompleted(masechta.id, type);
                      const unitCount = type === 'gemara' ? masechta.daf_count : masechta.perakim;
                      return (
                        <button
                          key={masechta.id}
                          onClick={() => toggleCompletion(masechta.id, type)}
                          className={cn(
                            'relative p-3 rounded-lg border-2 text-left transition-all hover:shadow-md cursor-pointer',
                            done
                              ? 'bg-green-50 border-green-300 hover:border-green-400'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          )}
                        >
                          {done && (
                            <CheckCircle2
                              size={14}
                              className="absolute top-1.5 right-1.5 text-green-500"
                            />
                          )}
                          <p className={cn(
                            'text-sm font-medium truncate',
                            done ? 'text-green-800' : 'text-slate-700'
                          )}>
                            {masechta.name}
                          </p>
                          <p className={cn(
                            'text-xs mt-0.5',
                            done ? 'text-green-600' : 'text-slate-400'
                          )}>
                            {unitCount} {unitLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
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
