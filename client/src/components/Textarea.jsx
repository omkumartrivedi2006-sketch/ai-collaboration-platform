import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  name,
  error,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        ref={ref}
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
          error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
