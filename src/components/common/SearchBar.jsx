import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value,
  onChange,
  className = '',
  ...props 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-4 py-2.5 
          bg-white dark:bg-slate-800 
          border border-gray-300 dark:border-slate-600 
          rounded-lg 
          text-gray-900 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          transition-all duration-200
        "
        {...props}
      />
    </div>
  );
};

export default SearchBar;