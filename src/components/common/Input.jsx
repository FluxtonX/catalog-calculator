import React from 'react';

const Input = ({ 
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props 
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          className={`
            w-full px-4 py-2.5 
            ${Icon ? 'pl-10' : ''}
            bg-white dark:bg-slate-800 
            border border-gray-300 dark:border-slate-600 
            rounded-lg 
            text-gray-900 dark:text-gray-100 
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;