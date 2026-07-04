import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ breadcrumbs = [], onNavigate }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-sans select-none">
      <button
        onClick={() => onNavigate(null, 'Root')}
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Drive</span>
      </button>

      {breadcrumbs.map((bc, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={bc.id}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-350" />
            <button
              onClick={() => !isLast && onNavigate(bc.id, bc.name)}
              disabled={isLast}
              className={`transition-colors ${
                isLast
                  ? 'text-slate-800 font-extrabold cursor-default'
                  : 'hover:text-indigo-600 cursor-pointer'
              }`}
            >
              {bc.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
