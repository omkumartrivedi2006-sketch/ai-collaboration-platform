import React, { useEffect } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import ChartCard from '../components/ChartCard';
import AnalyticsFilter from '../components/AnalyticsFilter';
import Loader from '../components/Loader';
import { Award, Briefcase, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const ProjectAnalytics = () => {
  const { projectStats, loading, filters, updateFilters, fetchProjectAnalytics } = useAnalytics();

  useEffect(() => {
    fetchProjectAnalytics();
  }, [fetchProjectAnalytics, filters.startDate, filters.endDate, filters.projectId, filters.department, filters.employeeId, filters.status, filters.priority]);

  if (loading && projectStats.length === 0) {
    return <Loader size="lg" message="Compiling project velocity matrices..." fullPage />;
  }

  // Format charts data (completion rate across projects)
  const chartData = projectStats.map(p => ({
    name: p.code,
    'Completion Rate %': p.metrics.completionRate,
    'Overdue Tasks': p.metrics.overdueTasks
  }));

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Project Portfolio Analytics</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Detailed metrics, sprint velocity charts, and health audit logs per project workspace
        </p>
      </div>

      <AnalyticsFilter filters={filters} onFilterChange={updateFilters} onRefresh={fetchProjectAnalytics} />

      {projectStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Progress Velocity Chart */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard
              type="bar"
              data={chartData}
              dataKeys={['Completion Rate %', 'Overdue Tasks']}
              title="Project Sprint Velocity"
              subtitle="Completion percentages vs Overdue risk metrics per workspace code"
            />

            {/* Detailed workspaces stats list */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Workspaces Detailed Statistics
              </h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {projectStats.map((p) => (
                  <div key={p.id} className="border border-slate-150 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded text-[8px] font-bold border border-indigo-150 uppercase">
                          {p.code}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1.5">{p.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold">Health Score:</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded border ${
                          p.healthScore >= 80 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                            : p.healthScore >= 50 
                            ? 'bg-amber-50 text-amber-700 border-amber-150' 
                            : 'bg-rose-50 text-rose-700 border-rose-150'
                        }`}>
                          {p.healthScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Sprint Completion Progress</span>
                        <span>{p.metrics.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.metrics.completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Mini metrics counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Total Tasks</p>
                        <p className="font-bold text-slate-700 mt-0.5">{p.metrics.totalTasks}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Completed</p>
                        <p className="font-bold text-emerald-650 mt-0.5">{p.metrics.completedTasks}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Overdue</p>
                        <p className="font-bold text-rose-650 mt-0.5">{p.metrics.overdueTasks}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Velocity</p>
                        <p className="font-bold text-indigo-650 mt-0.5">{p.metrics.avgCompletionTimeDays}d</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Health Score assessment list & top performers */}
          <div className="space-y-6">
            
            {/* Health Analysis Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-500" />
                Workspace Portfolio Assessment
              </h3>
              <div className="space-y-4">
                {projectStats.map((p) => {
                  const isHealthy = p.healthScore >= 75;
                  const hasOverdue = p.metrics.overdueTasks > 0;
                  return (
                    <div key={p.id} className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <div className={`p-1.5 rounded-lg border ${
                        isHealthy ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        {isHealthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-750 text-[11px]">{p.code} Health</p>
                        <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
                          {isHealthy 
                            ? `Optimal condition. Task completion rate is stable. ${hasOverdue ? 'Monitor minor overdue backlogs.' : 'All deadlines are healthy.'}`
                            : `At risk state. Overdue backlogs (${p.metrics.overdueTasks}) exceed buffer standard. Immediate reallocation required.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats highlight widget */}
            <div className="bg-slate-900 border border-slate-850 text-slate-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                <Briefcase className="h-32 w-32" />
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">Management Note</h4>
              <p className="text-[10px] leading-relaxed font-semibold text-slate-400">
                To archive completed workspaces or shift resources, navigate to the **Projects** dashboard. Health index is recalculated dynamically on modifications.
              </p>
            </div>

          </div>

        </div>
      )}

      {projectStats.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
          No projects available in this scope.
        </div>
      )}

    </div>
  );
};

export default ProjectAnalytics;
