import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg 
        bg-gray-100 dark:bg-slate-800 
        hover:bg-gray-200 dark:hover:bg-slate-700 
        text-gray-700 dark:text-gray-300
        transition-all duration-200
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;