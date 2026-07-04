import React from 'react';

const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl'
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr[0].toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 shadow-sm ${sizeStyles[size]} ${className}`}
        onError={(e) => {
          e.target.style.display = 'none'; // hide broken image and let text fallback render if we can, or set fallback
        }}
      />
    );
  }

  return (
    <div className={`rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center border border-indigo-200 shadow-inner uppercase tracking-wider ${sizeStyles[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
