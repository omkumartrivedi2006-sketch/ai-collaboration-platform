import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3 font-sans animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
          <div className="h-3 w-1/3 bg-slate-200 rounded" />
          <div className="h-2 w-full bg-slate-200 rounded" />
          <div className="h-2 w-5/6 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
