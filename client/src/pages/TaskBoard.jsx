import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTasks from '../context/TaskContext';
import projectService from '../services/projectService';
import api from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import Button from '../components/Button';
import SearchBox from '../components/SearchBox';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const TaskBoard = () => {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    filters,
    fetchTasks,
    updateFilters,
    resetFilters,
    updateTaskStatus
  } = useTasks();

  const [projects, setProjects] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);

  // Fetch tasks on filter change
  useEffect(() => {
    fetchTasks();
  }, [
    fetchTasks,
    filters.projectId,
    filters.assignedTo,
    filters.priority,
    filters.search,
    filters.isArchived
  ]);

  // Load project filters and user directory filters
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const canCreate = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Task Board</h2>
          <p className="text-xs text-slate-400 font-semibold">Track and coordinate project deliverables on the Kanban board</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Link to="/tasks/list" className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <List className="h-4 w-4" /> List View
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

      {/* Filters Area */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <SearchBox
            value={filters.search}
            onChange={handleSearch}
            placeholder="Search task by title..."
          />

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
        </div>

        <button
          onClick={resetFilters}
          className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Kanban Board Area */}
      {loading && tasks.length === 0 ? (
        <Loader size="lg" />
      ) : (
        <div className="min-h-[500px]">
          <KanbanBoard tasks={tasks} onTaskMove={handleStatusChange} />
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
