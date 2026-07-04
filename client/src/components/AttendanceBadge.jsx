import React from 'react';

export const AttendanceBadge = ({ status }) => {
  const styles = {
    INVITED: 'bg-amber-50 text-amber-700 border-amber-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
    ATTENDED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ABSENT: 'bg-slate-50 text-slate-500 border-slate-200'
  };

  const label = {
    INVITED: 'Pending',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    ATTENDED: 'Attended',
    ABSENT: 'Absent'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${styles[status] || styles.INVITED}`}>
      {label[status] || status}
    </span>
  );
};

export default AttendanceBadge;
