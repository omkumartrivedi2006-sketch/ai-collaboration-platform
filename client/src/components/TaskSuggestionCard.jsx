import React, { useState, useEffect } from 'react';
import useProjects from '../context/ProjectContext';
import taskService from '../services/taskService';
import api from '../services/api';
import Card from './Card';
import Button from './Button';
import toast from 'react-hot-toast';

export const TaskSuggestionCard = ({ tasks = [], onComplete }) => {
  const { projects, fetchProjects } = useProjects();
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [savingIndex, setSavingIndex] = useState(null);
  const [savedIndices, setSavedIndices] = useState([]);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects({ limit: 100 });
    }
    api.get('/auth/users')
      .then(res => setUsers(res.data.data.users || []))
      .catch(err => console.error(err));
  }, [projects.length, fetchProjects]);

  const handleCreateTask = async (task, index) => {
    if (!selectedProject) {
      toast.error('Please select a project workspace first');
      return;
    }

    setSavingIndex(index);
    try {
      // Find user ID matching suggestedAssignee name
      const assignee = users.find(u => u.name.toLowerCase().includes(task.suggestedAssignee?.toLowerCase() || ''));
      const payload = {
        title: task.title,
        description: task.description,
        priority: task.priority || 'MEDIUM',
        status: 'TODO',
        projectId: selectedProject,
        assignedTo: assignee ? assignee.id : null,
        deadline: task.deadline ? new Date(task.deadline).toISOString() : null
      };

      await taskService.createTask(payload);
      toast.success(`Task "${task.title}" created successfully!`);
      setSavedIndices(prev => [...prev, index]);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to save task');
    } finally {
      setSavingIndex(null);
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-4 font-sans text-xs">
      <Card title="AI Suggested Tasks" subtitle="Confirm and save suggested tasks directly to your backlog">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Select Project Workspace</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Choose Project Workspace --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            {tasks.map((task, idx) => {
              const isSaved = savedIndices.includes(idx);
              return (
                <div key={idx} className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{task.title}</h4>
                      <span className="bg-amber-50 text-amber-705 border border-amber-200 px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase">
                        {task.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-slate-500 font-semibold leading-relaxed mt-0.5">{task.description}</p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                      <span>Assignee: {task.suggestedAssignee || 'Unassigned'}</span>
                      {task.deadline && <span>Deadline: {task.deadline}</span>}
                    </div>
                  </div>

                  <div>
                    {isSaved ? (
                      <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-[10px]">
                        Saved
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        loading={savingIndex === idx}
                        disabled={savingIndex !== null}
                        onClick={() => handleCreateTask(task, idx)}
                        className="cursor-pointer"
                      >
                        Create Task
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {onComplete && (
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" onClick={onComplete} className="cursor-pointer">
                Clear Task Suggestions
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TaskSuggestionCard;
