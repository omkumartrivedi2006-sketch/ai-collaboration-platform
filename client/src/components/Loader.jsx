import React from 'react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizeStyles = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-indigo-100 border-t-indigo-600 ${sizeStyles[size]}`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <span className="text-sm font-semibold text-slate-600 tracking-wide">Loading platform...</span>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default Loader;
