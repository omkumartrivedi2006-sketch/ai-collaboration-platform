import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerActions, ...props }) => {
  return (
    <div className={`bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden ${className}`} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-bold text-slate-900 leading-6">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
};

export default Card;
