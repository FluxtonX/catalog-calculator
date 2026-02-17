import * as Tooltip from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

const InfoTooltip = ({ content }) => (
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button type="button" className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 transition-colors ml-1.5 flex-shrink-0">
          <Info size={10} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="max-w-xs px-3 py-2 text-xs leading-relaxed bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-2xl z-50" sideOffset={6}>
          {content}
          <Tooltip.Arrow className="fill-slate-900 dark:fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default InfoTooltip;