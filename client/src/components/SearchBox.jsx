import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBox = ({ value, onChange, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onChange(searchTerm);
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onChange]);

  return (
    <div className="relative w-full max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBox;
