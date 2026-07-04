import React from 'react';

const FilterPanel = ({ filters, onChange, onReset }) => {
  const statuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p.toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Show Projects</label>
          <select
            value={filters.isArchived ? 'true' : 'false'}
            onChange={(e) => onChange({ isArchived: e.target.value === 'true' })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="false">Active Projects</option>
            <option value="true">Archived Projects</option>
          </select>
        </div>
      </div>

      <button
        onClick={onReset}
        className="px-4 py-2 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterPanel;
