import * as Progress from "@radix-ui/react-progress";

const RadixProgress = ({ value, colorClass = "from-emerald-500 to-blue-500" }) => (
  <Progress.Root className="relative overflow-hidden bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 w-full" value={value}>
    <Progress.Indicator
      className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700`}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </Progress.Root>
);

export default RadixProgress;