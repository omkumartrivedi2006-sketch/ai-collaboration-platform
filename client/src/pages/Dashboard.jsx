import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FolderGit2, CheckCircle2, AlertTriangle, ArrowRight, Clock, Shield, MessageSquare, Bell, UserCheck, Hash } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { usePresence } from '../context/PresenceContext';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import PriorityBadge from '../components/PriorityBadge';
import Loader from '../components/Loader';
import FileIcon from '../components/FileIcon';
import fileService from '../services/fileService';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { conversations, selectConversation } = useChat();
  const { getOnlineMembers } = usePresence();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const projRes = await projectService.getProjects({ limit: 100 });
        const fetchedProjects = projRes.projects || [];
        setProjects(fetchedProjects);

        const taskRes = await taskService.getTasks({ limit: 1000 });
        const fetchedTasks = taskRes.tasks || [];
        setTasks(fetchedTasks);

        try {
          const filesData = await fileService.getFiles({ limit: 5 });
          setRecentFiles(filesData.files || []);
        } catch (e) {
          console.error(e);
        }

        try {
          const docsData = await fileService.getFiles({ mimeTypeGroup: 'documents', limit: 5 });
          setRecentDocs(docsData.files || []);
        } catch (e) {
          console.error(e);
        }

        try {
          const size = await fileService.getStorageUsage();
          setStorageSize(size);
        } catch (e) {
          console.error(e);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader size="lg" fullPage />;
  }

  // Calculate task statistics
  const myActiveTasks = tasks.filter(t => t.assignedTo === user?.id && t.status !== 'COMPLETED');
  const myTasksCount = myActiveTasks.length;

  const overdueTasksCount = tasks.filter(
    t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED'
  ).length;

  const completedTodayCount = tasks.filter((t) => {
    if (t.status !== 'COMPLETED') return false;
    const dateToCheck = t.completedAt || t.updatedAt;
    return new Date(dateToCheck).toDateString() === new Date().toDateString();
  }).length;

  const upcomingDeadlines = tasks
    .filter(t => t.deadline && t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  // Compute Project Progress Bar metrics
  const projectProgressList = projects.slice(0, 3).map((p) => {
    const projectTasks = tasks.filter((t) => t.projectId === p.id);
    const totalProjTasks = projectTasks.length;
    const completedProjTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
    const progressPercent = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;
    return {
      ...p,
      totalTasks: totalProjTasks,
      completedTasks: completedProjTasks,
      progressPercent
    };
  });

  const getUnreadStatus = (conv) => {
    const member = conv.members.find(m => m.userId === user?.id);
    if (!member) return false;
    const latest = conv.messages?.[0];
    if (latest && new Date(latest.createdAt) > new Date(member.lastReadAt) && latest.senderId !== user?.id) {
      return true;
    }
    return false;
  };

  const unreadChatsCount = conversations.filter(c => getUnreadStatus(c)).length;
  const onlineTeam = getOnlineMembers();
  const unreadAlerts = notifications.unread || [];

  const stats = [
    {
      title: 'My Active Tasks',
      value: myTasksCount,
      change: 'Pending deliverables',
      icon: CheckSquare,
      color: 'text-indigo-650 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Unread Chat Messages',
      value: unreadChatsCount,
      change: 'Awaiting your response',
      icon: MessageSquare,
      color: unreadChatsCount > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-600 bg-slate-50 border-slate-100'
    },
    {
      title: 'Active Alerts',
      value: unreadAlerts.length,
      change: 'Workspace notifications',
      icon: Bell,
      color: unreadAlerts.length > 0 ? 'text-rose-650 bg-rose-50 border-rose-100' : 'text-slate-650 bg-slate-50 border-slate-100'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 sm:p-8 text-white border border-indigo-950 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-xs text-indigo-200 font-semibold mt-1">
              {user?.designation || 'Team Member'} in{' '}
              <strong className="text-white">{user?.department || 'General Department'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-bold self-start md:self-auto capitalize">
            <Shield className="h-4 w-4 text-indigo-200" />
            Role: {user?.role}
          </div>
        </div>
      </div>

      {/* Stats counter row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`h-11 w-11 rounded-lg border flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <span className="text-indigo-650">{stat.change}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Active Tasks & Project Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks lists */}
          <Card
            title="My Pending Tasks"
            subtitle="Your active task assignments"
            headerActions={
              <Link to="/tasks" className="text-xs font-bold text-indigo-650 hover:text-indigo-700 flex items-center gap-1">
                Open Board <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-slate-100">
              {myActiveTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="min-w-0 flex-1">
                    <Link to={`/tasks/${t.id}`} className="font-bold text-xs text-slate-800 hover:text-indigo-650 block truncate">
                      {t.title}
                    </Link>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-0.5 inline-block">
                      {t.project?.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <span className="text-[10px] text-slate-450 font-bold whitespace-nowrap">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              ))}
              {myActiveTasks.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-405 italic font-bold">You have no pending tasks!</p>
              )}
            </div>
          </Card>

          {/* Recent Conversations */}
          <Card
            title="Recent Chat Channels"
            headerActions={
              <Link to="/chat" className="text-xs font-bold text-indigo-650 hover:text-indigo-700 flex items-center gap-1">
                Open Chat <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {conversations.slice(0, 3).map((c) => {
                const isUnread = getUnreadStatus(c);
                const isDirect = c.type === 'DIRECT';
                const other = c.members.find(m => m.userId !== user?.id);
                const title = isDirect ? other?.user?.name || 'Direct Chat' : c.name;
                const latestText = c.messages?.[0]?.message || 'No messages yet';

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3 border rounded-xl hover:border-slate-200 transition-colors bg-slate-50/20 ${
                      isUnread ? 'border-indigo-150 bg-indigo-50/5' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isDirect ? (
                        <Avatar src={other?.user?.avatar} name={title} size="sm" />
                      ) : (
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Hash className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{title}</h4>
                        <p className="text-[10px] text-slate-450 font-semibold truncate mt-0.5">{latestText}</p>
                      </div>
                    </div>
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
              {conversations.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400 italic">No chat conversations active.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Deadlines & Online Team */}
        <div className="space-y-6">
          {/* Online Team Members */}
          <Card title="Online Team" subtitle="Active colleagues right now">
            <div className="space-y-3">
              {onlineTeam.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{u.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {u.designation}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded capitalize">
                    {u.department || 'General'}
                  </span>
                </div>
              ))}
              {onlineTeam.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-405 italic font-bold">No other team members online.</p>
              )}
            </div>
          </Card>

          {/* Project Progress tracking */}
          <Card title="Project Progress">
            <div className="space-y-4">
              {projectProgressList.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Link to={`/projects/${p.id}`} className="font-bold text-slate-800 hover:text-indigo-650 truncate">
                      {p.name}
                    </Link>
                    <span className="font-extrabold text-indigo-650">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Module 5: Enterprise Document & Storage Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Enterprise Files"
            subtitle="Recently uploaded file management assets"
            headerActions={
              <Link to="/files" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Open Drive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-slate-100">
              {recentFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <FileIcon extension={f.extension} mimeType={f.mimeType} className="h-5 w-5" />
                    <a
                      href={fileService.getDownloadUrl(f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-slate-800 hover:text-indigo-600 truncate hover:underline"
                    >
                      {f.name}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">
                    <span>v{f.version}</span>
                    <span>•</span>
                    <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              ))}
              {recentFiles.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400 italic font-bold">No recent files uploaded.</p>
              )}
            </div>
          </Card>

          <Card
            title="Recently Uploaded Documents"
            subtitle="Text, Word, Excel, CSV, PDF and presentations"
          >
            <div className="divide-y divide-slate-100">
              {recentDocs.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <FileIcon extension={f.extension} mimeType={f.mimeType} className="h-5 w-5" />
                    <a
                      href={fileService.getDownloadUrl(f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-xs text-slate-800 hover:text-indigo-650 truncate hover:underline"
                    >
                      {f.name}
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {recentDocs.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400 italic font-bold">No documents uploaded.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Drive Storage Usage" subtitle="Enterprise storage metrics">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Total Space Used</span>
                <span className="font-extrabold text-indigo-600">
                  {((storageSize || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB / 10 GB
                </span>
              </div>
              <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-650 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round(((storageSize || 0) / (10 * 1024 * 1024 * 1024)) * 100), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold italic">
                SaaS Enterprise storage tier limit: 10 GB
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CheckSquare = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Dashboard;
