import React from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks = [], onTaskMove }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  const columns = [
    { id: 'TODO', title: 'Todo', color: 'border-slate-100 bg-slate-50/40' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-100 bg-indigo-50/10' },
    { id: 'IN_REVIEW', title: 'In Review', color: 'border-sky-100 bg-sky-50/10' },
    { id: 'BLOCKED', title: 'Blocked', color: 'border-rose-100 bg-rose-50/10' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-100 bg-emerald-50/10' }
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskMove(taskId, newStatus);
    }
  };

  const getColumnTasks = (status) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full items-start overflow-x-auto min-w-[900px] lg:min-w-0 pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getColumnTasks(col.id)}
            color={col.color}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
