// Replaces the original HTML range input with @radix-ui/react-slider
import * as SliderPrimitive from "@radix-ui/react-slider";
import InfoTooltip from "../../valuation/ui/InfoTooltip"; // reuse existing

const InputSlider = ({ label, value, onValueChange, min, max, step, unit, format, tooltip }) => {
  const displayValue = format ? format(value) : `${value}${unit || ""}`;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
          {label}
          {tooltip && <InfoTooltip content={tooltip} />}
        </label>
        <span className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-500/30 tabular-nums flex-shrink-0">
          {displayValue}
        </span>
      </div>

      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([val]) => onValueChange(val)}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-2">
          <SliderPrimitive.Range className="absolute bg-gradient-to-r from-red-500 to-rose-400 rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-5 h-5 bg-white dark:bg-slate-200 border-2 border-red-500 rounded-full shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all cursor-pointer hover:scale-110"
          aria-label={label}
        />
      </SliderPrimitive.Root>

      {/* Min/Max labels */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
        <span>{format ? format(min) : `${min}${unit || ""}`}</span>
        <span>{format ? format(max) : `${max}${unit || ""}`}</span>
      </div>
    </div>
  );
};

export default InputSlider;