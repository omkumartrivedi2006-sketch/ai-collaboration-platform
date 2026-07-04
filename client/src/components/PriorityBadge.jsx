import React from 'react';

const PriorityBadge = ({ priority }) => {
  const styles = {
    LOW: 'bg-slate-50 text-slate-650 border-slate-200',
    MEDIUM: 'bg-sky-50 text-sky-750 border-sky-100',
    HIGH: 'bg-orange-50 text-orange-750 border-orange-100',
    CRITICAL: 'bg-rose-50 text-rose-750 border-rose-100',
    URGENT: 'bg-rose-50 text-rose-750 border-rose-100'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${styles[priority] || styles.MEDIUM}`}>
      {priority?.toLowerCase()}
    </span>
  );
};

export default PriorityBadge;
