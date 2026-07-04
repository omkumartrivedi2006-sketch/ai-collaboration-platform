import React, { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import Card from '../components/Card';
import KPICard from '../components/KPICard';
import Loader from '../components/Loader';
import { Users, Briefcase, CheckSquare, Video, ShieldAlert, Sparkles, UserCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { stats, recentLogs, loading, fetchDashboardOverview } = useAdmin();

  useEffect(() => {
    fetchDashboardOverview();
  }, [fetchDashboardOverview]);

  if (loading && !stats) {
    return <Loader size="lg" message="Loading administrative metrics..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Administration Panel</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Workspace administration controls, user directories, and system audit logs
        </p>
      </div>

      {stats && (
        <>
          {/* Telemetry Dashboard Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Platform Users Directory"
              value={stats.totalUsers}
              icon={Users}
              trend={`${stats.activeUsers} Active`}
              trendType="up"
              description="Registered user profiles"
            />
            <KPICard
              title="Workspace Projects"
              value={stats.totalProjects}
              icon={Briefcase}
              trend="All Workspaces"
              trendType="up"
              description="Active collaborative boards"
            />
            <KPICard
              title="Active Backlog Tasks"
              value={stats.totalTasks}
              icon={CheckSquare}
              trend="Across Projects"
              trendType="up"
              description="Tracked backlogs cards"
            />
            <KPICard
              title="Sync Meetings Scheduled"
              value={stats.totalMeetings}
              icon={Video}
              trend={`${stats.pendingInvites} Pending Invites`}
              trendType="up"
              description="Video/Audio conference rooms"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Quick Actions & Settings Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <Card title="Quick Administrative Tasks" subtitle="Direct shortcut controls">
                <div className="space-y-2">
                  <Link
                    to="/admin/users"
                    className="w-full flex items-center justify-between p-3 border border-slate-150 rounded-xl hover:border-slate-350 hover:bg-slate-50 transition-all font-bold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-indigo-500" />
                      <span>Manage Users & Roles</span>
                    </div>
                  </Link>

                  <Link
                    to="/admin/departments"
                    className="w-full flex items-center justify-between p-3 border border-slate-150 rounded-xl hover:border-slate-350 hover:bg-slate-50 transition-all font-bold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      <span>Organize Departments</span>
                    </div>
                  </Link>

                  <Link
                    to="/admin/settings"
                    className="w-full flex items-center justify-between p-3 border border-slate-150 rounded-xl hover:border-slate-350 hover:bg-slate-50 transition-all font-bold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span>Configure Company Profile</span>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Status Note card */}
              <div className="bg-slate-900 border border-slate-850 text-slate-100 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                  <ShieldAlert className="h-32 w-32" />
                </div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">Auditing Active</h4>
                <p className="text-[10px] leading-relaxed font-semibold text-slate-400">
                  Every user action, role change, department deletion, and organization profile modification is recorded permanently in the system database for security compliance.
                </p>
              </div>
            </div>

            {/* Right Column: Timeline audit logs preview */}
            <div className="lg:col-span-2">
              <Card
                title="Recent System Audit Logs"
                subtitle="Last 10 administrative & system-wide actions"
                className="border border-slate-200 bg-white shadow-2xs"
              >
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="p-1.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-500 flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-750 text-[11px]">
                          {log.action} <span className="font-semibold text-indigo-650">({log.entity})</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          {log.user ? `Initiated by ${log.user.name} (${log.user.email})` : 'System Automated'}
                        </p>
                        {log.ipAddress && (
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1 py-0.5 rounded mr-2 mt-1 inline-block">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-405 font-bold whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}

                  {recentLogs.length === 0 && (
                    <p className="text-center text-slate-400 italic font-semibold py-12">No audit logs recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
