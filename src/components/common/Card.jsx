import React from 'react';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'default',
  ...props 
}) => {
  const baseStyles = 'bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700';
  const hoverStyles = hover ? 'card-hover cursor-pointer' : '';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;