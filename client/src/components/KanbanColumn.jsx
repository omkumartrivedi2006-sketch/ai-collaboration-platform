import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const KanbanColumn = ({ id, title, tasks = [], color = 'border-slate-200 bg-slate-50/50' }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full w-full min-h-[500px] border rounded-xl p-4 transition-colors duration-200 ${color} ${
        isOver ? 'bg-indigo-50/30 border-indigo-200' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-500 shadow-2xs">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-lg p-6 min-h-[120px] text-center text-[10px] text-slate-400 font-bold italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
