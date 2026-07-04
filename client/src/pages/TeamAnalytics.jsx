import React, { useEffect } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import ChartCard from '../components/ChartCard';
import AnalyticsFilter from '../components/AnalyticsFilter';
import Loader from '../components/Loader';
import Avatar from '../components/Avatar';
import { Users, LayoutList, Layers } from 'lucide-react';

export const TeamAnalytics = () => {
  const { teamStats, loading, filters, updateFilters, fetchTeamAnalytics } = useAnalytics();

  useEffect(() => {
    fetchTeamAnalytics();
  }, [fetchTeamAnalytics, filters.startDate, filters.endDate, filters.projectId, filters.department, filters.employeeId, filters.status, filters.priority]);

  if (loading && teamStats.length === 0) {
    return <Loader size="lg" message="Compiling team load balances..." fullPage />;
  }

  // Formatting Recharts data for workload balancing
  const chartData = teamStats.map(t => ({
    name: t.user.name,
    'Capacity Load %': t.metrics.loadPercentage,
    'Completed Tasks': t.metrics.completedTasks,
    'Pending Tasks': t.metrics.pendingTasks
  }));

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Team Workload & Capacity Analytics</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Monitor team capacity indicators, active workloads balancing, and velocity rates
        </p>
      </div>

      <AnalyticsFilter filters={filters} onFilterChange={updateFilters} onRefresh={fetchTeamAnalytics} />

      {teamStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workload balancing chart */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard
              type="bar"
              data={chartData}
              dataKeys={['Completed Tasks', 'Pending Tasks', 'Capacity Load %']}
              title="Team Workload Distribution"
              subtitle="Completed backlogs vs Pending workloads vs Estimated capacity load"
            />

            {/* Workload list */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <LayoutList className="h-4 w-4 text-indigo-500" />
                Workload Audit Registry
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {teamStats.map((t) => (
                  <div key={t.user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border border-slate-150 rounded-lg hover:border-slate-350 hover:bg-slate-50/20 transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar src={t.user.avatar} name={t.user.name} size="md" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{t.user.name}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate capitalize mt-0.5">
                          {t.user.designation || 'Engineer'} • {t.user.department || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
                      <div className="text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Assigned Tasks</p>
                        <p className="font-bold text-slate-700 mt-0.5">{t.metrics.totalTasks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Overdue</p>
                        <p className={`font-bold mt-0.5 ${t.metrics.overdueTasks > 0 ? 'text-rose-650' : 'text-slate-650'}`}>
                          {t.metrics.overdueTasks}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Velocity</p>
                        <p className="font-bold text-indigo-650 mt-0.5">{t.metrics.avgCompletionVelocityDays}d</p>
                      </div>
                      <div className="w-24 text-right">
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Capacity Load</p>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                          t.metrics.loadPercentage >= 80 
                            ? 'bg-rose-50 text-rose-700 border-rose-150' 
                            : t.metrics.loadPercentage >= 40 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-150' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                        }`}>
                          {t.metrics.loadPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right column: capacity recommendations and loads */}
          <div className="space-y-6">
            
            {/* Load Capacity Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-500" />
                Resource Balancing Directives
              </h3>
              <div className="space-y-4">
                {teamStats.map((t) => {
                  const isOverloaded = t.metrics.loadPercentage >= 80;
                  const isUnderutilized = t.metrics.loadPercentage < 35;
                  return (
                    <div key={t.user.id} className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                        isOverloaded ? 'bg-rose-50 border-rose-100 text-rose-600' : isUnderutilized ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}>
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-750 text-[11px]">{t.user.name}</p>
                        <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                          {isOverloaded 
                            ? '⚠️ **Capacity warning:** Workloads are overloaded. Reassign outstanding backlogs to underutilized members.'
                            : isUnderutilized 
                            ? '📈 **Underutilized:** Member has remaining bandwidth to take on extra backlog cards.'
                            : '✅ **Stable capacity:** Workload and tasks velocity are in optimal condition.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action guide widget */}
            <div className="bg-slate-900 border border-slate-850 text-slate-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                <Users className="h-32 w-32" />
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">Workload Optimization Tip</h4>
              <p className="text-[10px] leading-relaxed font-semibold text-slate-400">
                Regularly monitor velocity rates to identify bottleneck sources. Maintain load indexes between 40% and 75% for steady project progression.
              </p>
            </div>

          </div>

        </div>
      )}

      {teamStats.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
          No team members available in this project scope.
        </div>
      )}

    </div>
  );
};

export default TeamAnalytics;
