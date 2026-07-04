import React from 'react';
import { Link } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, AlertCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50
      }
    : undefined;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-slate-100 rounded-xl p-4 shadow-xs select-none ${
        isDragging ? 'opacity-40 border-indigo-200 shadow-md' : 'hover:shadow-sm hover:border-slate-200'
      } transition-all`}
    >
      <div {...attributes} {...listeners} className="flex justify-between items-start gap-3 cursor-grab active:cursor-grabbing mb-2">
        <div className="min-w-0 flex-1">
          <Link
            to={`/tasks/${task.id}`}
            className="text-xs font-bold text-slate-800 hover:text-indigo-650 block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </Link>
          <span className="text-[9px] font-mono font-bold text-slate-450 mt-0.5 inline-block uppercase">
            {task.project?.code || 'PROJECT'}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 font-bold line-clamp-2 h-7 leading-relaxed mb-3">
        {task.description || 'No description provided.'}
      </p>

      <div className="flex gap-1.5 flex-wrap items-center mb-3">
        <PriorityBadge priority={task.priority} />
        {isOverdue && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
            <AlertCircle className="h-3 w-3" /> Overdue
          </span>
        )}
      </div>

      <div className="h-px bg-slate-100/70 my-2" />

      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
        <div className="flex items-center gap-1.5">
          <Avatar src={task.assignee?.avatar} name={task.assignee?.name} size="xs" />
          <span className="truncate max-w-[80px]">{task.assignee?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No due date'}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
