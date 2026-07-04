import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAI } from '../context/AIContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import AnalyticsFilter from '../components/AnalyticsFilter';
import Loader from '../components/Loader';
import { FolderGit2, CheckSquare, Clock, Video, Sparkles, Brain, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const AnalyticsDashboard = () => {
  const { kpi, activities, loading, filters, updateFilters, fetchDashboardOverview } = useAnalytics();
  const { sendMessage } = useAI();
  const [aiInsights, setAiInsights] = useState('');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchDashboardOverview();
  }, [fetchDashboardOverview, filters.startDate, filters.endDate, filters.projectId, filters.department, filters.employeeId, filters.status, filters.priority]);

  const handleRefresh = () => {
    fetchDashboardOverview();
  };

  const handleGenerateInsights = async () => {
    if (!kpi) return;
    setGeneratingInsights(true);
    try {
      const prompt = `Analyze these current workspace metrics: Active Projects=${kpi.projectsCount}, Completed Projects=${kpi.completedProjectsCount}, Total Tasks=${kpi.totalTasks}, Completed Tasks=${kpi.completedTasks}, Pending Tasks=${kpi.pendingTasks}, Overdue Tasks=${kpi.overdueTasks}, Health Score=${kpi.healthScore}/100. Generate weekly insights, project risks, deadline risks, and productivity suggestions. Keep it concise.`;
      const res = await sendMessage(prompt);
      setAiInsights(res.message.content);
    } catch (e) {
      toast.error('AI Insights compilation failed');
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading && !kpi) {
    return <Loader size="lg" message="Loading organization intelligence..." fullPage />;
  }

  // Formatting chart data
  const taskDistributionData = kpi ? [
    { name: 'Completed', value: kpi.completedTasks },
    { name: 'Pending', value: kpi.pendingTasks },
    { name: 'Blocked', value: kpi.blockedTasks }
  ] : [];

  const activityData = kpi ? [
    { name: 'Completion %', rate: kpi.completionRate },
    { name: 'Health Score', rate: kpi.healthScore }
  ] : [];

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Executive Analytics Dashboard</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Real-time organizational KPI monitoring and predictive metrics
          </p>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={generatingInsights || !kpi}
          className="cursor-pointer bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-750 hover:to-violet-750 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{generatingInsights ? 'Compiling suggestions...' : 'Generate AI Insights'}</span>
        </button>
      </div>

      {/* Filters control panel */}
      <AnalyticsFilter filters={filters} onFilterChange={updateFilters} onRefresh={handleRefresh} />

      {kpi && (
        <>
          {/* KPI Dashboard Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Workspaces"
              value={kpi.projectsCount}
              icon={FolderGit2}
              trend={`${kpi.completedProjectsCount} Completed`}
              trendType="up"
              description="Active project boards"
            />
            <KPICard
              title="Sprint Task Volume"
              value={kpi.totalTasks}
              icon={CheckSquare}
              trend={`${kpi.completionRate}% Done`}
              trendType={kpi.completionRate >= 70 ? 'up' : 'down'}
              description="Total tracked backlogs"
            />
            <KPICard
              title="Risk/Overdue Backlogs"
              value={kpi.overdueTasks}
              icon={Clock}
              trend={`${kpi.blockedTasks} Blocked`}
              trendType={kpi.overdueTasks > 0 ? 'down' : 'up'}
              description="Requires immediate focus"
            />
            <KPICard
              title="Workspace Health Score"
              value={`${kpi.healthScore}/100`}
              icon={Brain}
              trend={`Avg velocity: ${kpi.avgCompletionDays}d`}
              trendType={kpi.healthScore >= 75 ? 'up' : 'down'}
              description="Backlog health index"
            />
          </div>

          {/* AI Insights Card */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 text-white rounded-xl p-5 shadow-md flex gap-4 items-start relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                <Brain className="h-40 w-40" />
              </div>
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">Predictive AI Insights & Risk Mitigations</h4>
                <div className="text-[10px] leading-relaxed font-semibold text-slate-300 space-y-1.5 whitespace-pre-wrap">
                  {aiInsights}
                </div>
              </div>
            </div>
          )}

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard
                type="area"
                data={activityData}
                dataKeys={['rate']}
                title="Workspace Progression Curve"
                subtitle="Completion rates vs Overall board health indexes"
                colors={['#4f46e5']}
              />
            </div>
            <div className="lg:col-span-1">
              <ChartCard
                type="donut"
                data={taskDistributionData}
                dataKeys={['value']}
                xAxisKey="name"
                title="Board Task States"
                subtitle="Distribution across todo, pending, blocked"
              />
            </div>
          </div>

          {/* Recent Workspace Actions & Upcoming deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Activities audit logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4">
                Workspace Modification Logs
              </h3>
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                      a.type === 'PROJECT' ? 'bg-indigo-50 border-indigo-100 text-indigo-650' : 'bg-emerald-50 border-emerald-100 text-emerald-650'
                    }`}>
                      {a.type === 'PROJECT' ? <FolderGit2 className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-750 truncate text-[11px]">
                        {a.user.name} <span className="font-medium text-slate-500">{a.action.toLowerCase().replace('_', ' ')}</span>
                      </p>
                      <p className="text-[10px] text-slate-550 font-semibold truncate mt-0.5">{a.title}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-slate-400 italic font-semibold py-8">No modifications logged in this period.</p>
                )}
              </div>
            </div>

            {/* Meetings Planner widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4">
                  Engagement & Meetings Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center mt-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Meetings Facilitated</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{kpi.totalMeetings}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Completed Syncs</p>
                    <p className="text-2xl font-black text-slate-850 mt-1">{kpi.completedMeetings}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex gap-2 items-center mt-4">
                <Video className="h-5 w-5 text-indigo-500" />
                <p className="text-[9px] leading-relaxed text-slate-500 font-medium">
                  Use the **Meetings Calendar** tab to schedule upcoming sprint syncs and launch secure Jitsi meetings.
                </p>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AnalyticsDashboard;
