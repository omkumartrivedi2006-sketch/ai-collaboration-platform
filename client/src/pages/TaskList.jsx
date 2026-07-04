import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, MoreVertical, Eye, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTasks from '../context/TaskContext';
import projectService from '../services/projectService';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Avatar from '../components/Avatar';
import SearchBox from '../components/SearchBox';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const TaskList = () => {
  const { user } = useAuth();
  const {
    tasks,
    totalTasks,
    loading,
    filters,
    fetchTasks,
    updateFilters,
    resetFilters,
    archiveTask,
    restoreTask,
    deleteTask
  } = useTasks();

  const [projects, setProjects] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [
    fetchTasks,
    filters.projectId,
    filters.assignedTo,
    filters.status,
    filters.priority,
    filters.search,
    filters.isArchived,
    filters.page,
    filters.sortBy,
    filters.sortOrder
  ]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const projRes = await projectService.getProjects({ limit: 100 });
        setProjects(projRes.projects || []);

        const userRes = await api.get('/auth/users');
        setDirectoryUsers(userRes.data.data.users || []);
      } catch (err) {
        console.error('Failed to load filter directories:', err);
      }
    };
    loadFiltersData();
  }, []);

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
  };

  const handleSortChange = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };

  const handleArchive = async (id) => {
    try {
      await archiveTask(id);
      toast.success('Task archived successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive task');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreTask(id);
      toast.success('Task restored successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted permanently');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const getPermission = (task) => {
    const isAdmin = user?.role === 'Admin';
    const isManager = user?.role === 'Manager';
    const isOwner = task.project?.managerId === user?.id || task.project?.createdBy === user?.id || task.createdBy === user?.id;

    return {
      canEdit: isAdmin || (isManager && isOwner),
      canDelete: isAdmin || (isManager && isOwner)
    };
  };

  const canCreate = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Task List</h2>
          <p className="text-xs text-slate-400 font-semibold">View and query tasks in a tabular spreadsheet format</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Link to="/tasks" className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <LayoutGrid className="h-4 w-4" /> Board View
          </Link>
          {canCreate && (
            <Link to="/tasks/create">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Create Task
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <SearchBox value={filters.search} onChange={handleSearch} placeholder="Search task by title..." />

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => updateFilters({ projectId: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Assignee</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => updateFilters({ assignedTo: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Assignees</option>
              {directoryUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilters({ priority: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Show Tasks</label>
            <select
              value={filters.isArchived ? 'true' : 'false'}
              onChange={(e) => updateFilters({ isArchived: e.target.value === 'true' })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="false">Active Tasks</option>
              <option value="true">Archived Tasks</option>
            </select>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer transition-colors"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <Loader size="lg" />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/55" onClick={() => handleSortChange('title')}>
                  Task Title {filters.sortBy === 'title' && (filters.sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/55" onClick={() => handleSortChange('priority')}>
                  Priority {filters.sortBy === 'priority' && (filters.sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/55" onClick={() => handleSortChange('deadline')}>
                  Deadline {filters.sortBy === 'deadline' && (filters.sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              {tasks.map((task) => {
                const { canEdit, canDelete } = getPermission(task);
                const isMenuOpen = activeMenu === task.id;

                return (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/tasks/${task.id}`} className="font-bold text-slate-800 hover:text-indigo-650 transition-colors">
                        {task.title}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate max-w-xs">{task.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        {task.project?.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={task.assignee?.avatar} name={task.assignee?.name} size="sm" />
                        <span>{task.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-550 font-bold">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(isMenuOpen ? null : task.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-6 mt-1 w-44 bg-white border border-slate-100 rounded-lg shadow-lg z-20 py-1.5 divide-y divide-slate-100 text-left">
                            <div>
                              <Link
                                to={`/tasks/${task.id}`}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                                onClick={() => setActiveMenu(null)}
                              >
                                <Eye className="h-3.5 w-3.5" /> View Details
                              </Link>
                              {canEdit && (
                                <Link
                                  to={`/tasks/edit/${task.id}`}
                                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Edit className="h-3.5 w-3.5" /> Edit Task
                                </Link>
                              )}
                            </div>
                            <div>
                              {canEdit && (
                                <button
                                  onClick={() => {
                                    task.isArchived ? handleRestore(task.id) : handleArchive(task.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-left text-slate-700 cursor-pointer"
                                >
                                  {task.isArchived ? (
                                    <>
                                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                                    </>
                                  ) : (
                                    <>
                                      <Archive className="h-3.5 w-3.5" /> Archive
                                    </>
                                  )}
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => {
                                    handleDelete(task.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 text-left cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-400 font-bold italic">
              No tasks found.
            </div>
          )}
        </div>
      )}

      <Pagination
        page={filters.page}
        limit={filters.limit}
        total={totalTasks}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TaskList;
