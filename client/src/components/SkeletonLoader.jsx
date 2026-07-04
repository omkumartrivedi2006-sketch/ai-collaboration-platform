import React from 'react';

export const SkeletonLoader = ({ type = 'page' }) => {
  if (type === 'card') {
    return (
      <div className="border border-slate-200 bg-white p-5 rounded-2xl animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-3/4 bg-slate-100 rounded" />
        <div className="h-8 w-full bg-slate-55/40 rounded mt-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs animate-pulse p-4">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-1/4 bg-slate-250 rounded" />
        <div className="h-3 w-1/2 bg-slate-150 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="border border-slate-200 bg-white p-5 rounded-2xl space-y-4">
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
            <div className="h-3 w-2/3 bg-slate-100 rounded" />
            <div className="h-10 w-full bg-slate-100 rounded mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
