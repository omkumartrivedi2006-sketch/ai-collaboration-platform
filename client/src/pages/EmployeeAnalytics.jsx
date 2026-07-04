import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import ProductivityCard from '../components/ProductivityCard';
import ChartCard from '../components/ChartCard';
import AnalyticsFilter from '../components/AnalyticsFilter';
import Loader from '../components/Loader';
import { Sparkles, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const EmployeeAnalytics = () => {
  const { employeeStats, loading, filters, updateFilters, fetchEmployeeAnalytics } = useAnalytics();
  const [activeEmployeeIdx, setActiveEmployeeIdx] = useState(0);

  useEffect(() => {
    fetchEmployeeAnalytics();
  }, [fetchEmployeeAnalytics, filters.startDate, filters.endDate, filters.projectId, filters.department, filters.employeeId, filters.status, filters.priority]);

  if (loading && employeeStats.length === 0) {
    return <Loader size="lg" message="Compiling employee productivity ratings..." fullPage />;
  }

  const activeEmployee = employeeStats[activeEmployeeIdx] || null;

  // Chart data formatting for comparing employee scores
  const comparisonData = employeeStats.map(e => ({
    name: e.employee.name,
    'Productivity Score': e.metrics.productivityScore,
    'Tasks Completed': e.metrics.completedTasks
  }));

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Employee Productivity Metrics</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          AI-calculated performance indexes, collaboration metrics, and workload assessments
        </p>
      </div>

      <AnalyticsFilter filters={filters} onFilterChange={updateFilters} onRefresh={fetchEmployeeAnalytics} />

      {employeeStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Selector & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Employee selector chips */}
            {employeeStats.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-2.5">Select Team Member</h4>
                <div className="flex flex-wrap gap-2">
                  {employeeStats.map((e, index) => {
                    const isActive = index === activeEmployeeIdx;
                    return (
                      <button
                        key={e.employee.id}
                        onClick={() => setActiveEmployeeIdx(index)}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-indigo-605 text-white shadow-sm' 
                            : 'bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {e.employee.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Productivity audit layout */}
            {activeEmployee && (
              <ProductivityCard employeeStats={activeEmployee} />
            )}

            {/* Comparison Charts */}
            <ChartCard
              type="bar"
              data={comparisonData}
              dataKeys={['Productivity Score', 'Tasks Completed']}
              title="Productivity Benchmark Comparison"
              subtitle="Comparison of AI ratings vs completed backlogs across members"
            />

          </div>

          {/* Right Column: Performance insights widgets */}
          <div className="space-y-6">
            
            {/* Activities summary card */}
            {activeEmployee && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Productivity Insights Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="p-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-750 text-[10px]">Backlog Completion Rate</p>
                      <p className="text-[9px] font-semibold text-slate-450 mt-0.5">
                        Completed **{activeEmployee.metrics.completedTasks}** out of **{activeEmployee.metrics.assignedTasks}** assigned backlogs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-750 text-[10px]">Meeting Engagement Index</p>
                      <p className="text-[9px] font-semibold text-slate-450 mt-0.5">
                        Actively participated in **{activeEmployee.metrics.meetingsAttended}** completed sprint synchronization meetings.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="p-1.5 bg-purple-50 border border-purple-100 text-purple-650 rounded-lg">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-750 text-[10px]">Document & Asset Uploads</p>
                      <p className="text-[9px] font-semibold text-slate-450 mt-0.5">
                        Uploaded **{activeEmployee.metrics.filesUploaded}** documentation files and attachments to task boards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick assessment guide */}
            <div className="bg-slate-900 border border-slate-850 text-slate-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                <Sparkles className="h-32 w-32" />
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">Predictive Score Algorithm</h4>
              <p className="text-[10px] leading-relaxed font-semibold text-slate-400">
                Productivity scores are calculated dynamically based on task completion velocities, chat messages count, files uploaded, meetings attended, and overdue penalties.
              </p>
            </div>

          </div>

        </div>
      )}

      {employeeStats.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
          No employee metrics available in this filter.
        </div>
      )}

    </div>
  );
};

export default EmployeeAnalytics;
