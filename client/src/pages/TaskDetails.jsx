import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckSquare, Layers, Copy, Archive, RotateCcw, AlertTriangle, AlertCircle, PlayCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTasks from '../context/TaskContext';
import projectService from '../services/projectService';
import api from '../services/api';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CommentBox from '../components/CommentBox';
import AttachmentList from '../components/AttachmentList';
import TaskTimeline from '../components/TaskTimeline';
import Loader from '../components/Loader';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeTask: task,
    loading,
    fetchTaskDetails,
    updateTaskStatus,
    updateTaskPriority,
    createTask,
    archiveTask,
    restoreTask,
    addComment,
    updateComment,
    deleteComment,
    addAttachment,
    deleteAttachment
  } = useTasks();

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTaskDetails(id);
      } catch (err) {
        toast.error('Failed to load task details');
        navigate('/tasks');
      }
    };
    loadData();
  }, [id, fetchTaskDetails, navigate]);

  useEffect(() => {
    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await api.get(`/tasks/${id}/activity`);
        setActivities(response.data.data.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    };

    if (task && task.id === id) {
      loadActivities();
    }
  }, [id, task]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      toast.success('Task status updated!');
      // Reload activities
      const response = await api.get(`/tasks/${id}/activity`);
      setActivities(response.data.data.activities || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityUpdate = async (newPriority) => {
    try {
      await updateTaskPriority(id, newPriority);
      toast.success('Task priority updated!');
      // Reload activities
      const response = await api.get(`/tasks/${id}/activity`);
      setActivities(response.data.data.activities || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
    }
  };

  const handleDuplicate = async () => {
    if (!task) return;
    try {
      const cloned = await createTask({
        projectId: task.projectId,
        title: `${task.title} (Copy)`,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || undefined,
        estimatedHours: task.estimatedHours || undefined,
        startDate: task.startDate || undefined,
        deadline: task.deadline || undefined
      });
      toast.success('Task duplicated successfully!');
      navigate(`/tasks/${cloned.id}`);
    } catch (err) {
      toast.error('Failed to duplicate task');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveTask(id);
      toast.success('Task archived');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to archive task');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreTask(id);
      toast.success('Task restored');
      await fetchTaskDetails(id);
    } catch (err) {
      toast.error('Failed to restore task');
    }
  };

  if (loading || !task || task.id !== id) {
    return <Loader size="lg" fullPage />;
  }

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isOwner = task.project?.managerId === user?.id || task.project?.createdBy === user?.id || task.createdBy === user?.id;
  const isAssignee = task.assignedTo === user?.id;

  const canManageTask = isAdmin || (isManager && isOwner);
  const canUpdateStatus = canManageTask || isAssignee;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{task.title}</h2>
              <StatusBadge status={task.status} />
              {task.isArchived && (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Project: {task.project?.name} ({task.project?.code})</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {canManageTask && (
            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="h-4 w-4" /> Duplicate
            </button>
          )}

          {canManageTask && (
            <button
              onClick={task.isArchived ? handleRestore : handleArchive}
              className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {task.isArchived ? (
                <>
                  <RotateCcw className="h-4 w-4" /> Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" /> Archive
                </>
              )}
            </button>
          )}

          {canManageTask && (
            <Link to={`/tasks/edit/${task.id}`}>
              <Button size="sm">Edit Task</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Task Description">
            <p className="text-xs text-slate-650 leading-relaxed font-semibold whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </Card>

          <Card title="Comments">
            <CommentBox
              comments={task.comments}
              onAddComment={(text) => addComment(task.id, text)}
              onUpdateComment={updateComment}
              onDeleteComment={deleteComment}
            />
          </Card>

          <Card title="Attachments">
            <AttachmentList
              attachments={task.attachments}
              onAddAttachment={(form) => addAttachment(task.id, form)}
              onDeleteAttachment={deleteAttachment}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Task Metadata">
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                {canUpdateStatus ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                ) : (
                  <div className="pt-1"><StatusBadge status={task.status} /></div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Priority</span>
                {canManageTask ? (
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityUpdate(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                ) : (
                  <div className="pt-1"><PriorityBadge priority={task.priority} /></div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assignee</span>
                <div className="flex items-center gap-2">
                  <Avatar src={task.assignee?.avatar} name={task.assignee?.name} size="sm" />
                  <span className="text-slate-800 font-bold">{task.assignee?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Creator</span>
                <div className="flex items-center gap-2">
                  <Avatar src={task.creator?.avatar} name={task.creator?.name} size="sm" />
                  <span className="text-slate-800 font-bold">{task.creator?.name}</span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <PlayCircle className="h-4 w-4 text-indigo-500" /> Estimated Hours
                </span>
                <span className="text-slate-800 font-extrabold">{task.estimatedHours ? `${task.estimatedHours} hrs` : 'Not specified'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Clock className="h-4 w-4 text-indigo-500" /> Actual Hours
                </span>
                <span className="text-slate-800 font-extrabold">{task.actualHours ? `${task.actualHours} hrs` : '0 hrs'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-indigo-500" /> Deadline
                </span>
                <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No due date'}
                </span>
              </div>

              {isOverdue && (
                <div className="flex items-start gap-1 bg-rose-50 border border-rose-100 p-2.5 rounded text-[10px] text-rose-600 font-bold">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>This task has passed its deadline! Please update its specs.</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Activity Log">
            {loadingActivities ? (
              <Loader size="sm" />
            ) : (
              <TaskTimeline activities={activities} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
