import React from 'react';
import Avatar from './Avatar';
import { Clock } from 'lucide-react';

const TaskTimeline = ({ activities = [] }) => {
  const getActionMessage = (act) => {
    const action = act.action;
    const oldVal = act.oldValue?.toLowerCase()?.replace('_', ' ') || '';
    const newVal = act.newValue?.toLowerCase()?.replace('_', ' ') || '';

    switch (action) {
      case 'TASK_CREATED':
        return 'created this task';
      case 'TASK_UPDATED':
        return 'updated task details';
      case 'STATUS_CHANGED':
        return `changed status from ${oldVal} to ${newVal}`;
      case 'PRIORITY_CHANGED':
        return `changed priority from ${oldVal} to ${newVal}`;
      case 'ASSIGNMENT_CHANGED':
        return `changed assignment from ${oldVal} to ${newVal}`;
      case 'COMMENT_ADDED':
        return 'added a comment';
      case 'ATTACHMENT_UPLOADED':
        return `uploaded attachment: ${act.newValue}`;
      case 'TASK_COMPLETED':
        return 'completed this task';
      case 'TASK_ARCHIVED':
        return 'archived this task';
      case 'TASK_RESTORED':
        return 'restored this task';
      default:
        return act.newValue || 'modified this task';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400 font-bold italic">
        No history logs available yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((act, idx) => (
          <li key={act.id || idx}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <Avatar src={act.user?.avatar} name={act.user?.name} size="sm" />
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between gap-4">
                  <p className="text-xs text-slate-650">
                    <strong className="font-bold text-slate-900">{act.user?.name}</strong>{' '}
                    <span className="text-slate-500 font-semibold">{getActionMessage(act)}</span>
                  </p>
                  <div className="text-right text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskTimeline;
