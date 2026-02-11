// src/components/ui/InputSlider.jsx - CREATE THIS NEW FILE
import React from 'react';

const InputSlider = ({ 
  label, 
  value, 
  onValueChange, 
  min, 
  max, 
  step, 
  unit = '', 
  format 
}) => {
  const displayValue = format ? format(value) : `${value}${unit}`;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) 100%)`
        }}
      />
    </div>
  );
};

export default InputSlider;