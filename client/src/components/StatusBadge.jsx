import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    PLANNING: 'bg-slate-100 text-slate-800 border-slate-200',
    ACTIVE: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
    TODO: 'bg-slate-100 text-slate-600 border-slate-200',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    IN_REVIEW: 'bg-sky-50 text-sky-700 border-sky-100',
    BLOCKED: 'bg-rose-50 text-rose-700 border-rose-150'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${styles[status] || styles.PLANNING}`}>
      {status?.toLowerCase()?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
