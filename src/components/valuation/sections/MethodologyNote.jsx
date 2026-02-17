import * as Accordion from "@radix-ui/react-accordion";
import { Info, ChevronDown } from "lucide-react";

const MethodologyNote = () => (
  <Accordion.Root type="single" collapsible className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/10 dark:to-slate-900 rounded-3xl border-2 border-blue-200 dark:border-blue-500/20 shadow-xl overflow-hidden">
    <Accordion.Item value="methodology">
      <Accordion.Trigger className="w-full flex items-center gap-4 p-5 sm:p-7 text-left group">
        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
          <Info size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-blue-800 dark:text-blue-300 text-sm sm:text-base">Valuation Methodology</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Click to view calculation details</p>
        </div>
        <ChevronDown size={18} className="text-blue-500 transition-transform duration-300 group-data-[state=open]:rotate-180 flex-shrink-0" />
      </Accordion.Trigger>
      <Accordion.Content className="px-5 sm:px-7 pb-5 sm:pb-7 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc list-inside border-t border-blue-200 dark:border-blue-500/20 pt-4">
          <li>Priority: (1) Recent 30-day, (2) Normalized 28-day, (3) Top tracks + featured adj, (4) Lifetime with decay</li>
          <li><strong>Featured tracks</strong> containing "feat." or "featuring" calculated at 25% revenue when not primary artist</li>
          <li>Geo-weighted Spotify payout rates based on listener geographic distribution</li>
          <li>LTM Revenue = monthly streams × geo-weighted rate × 12</li>
          <li>Valuations: Conservative (6×), Market (8×), Premium (10×)</li>
          <li>Decay factors: 0–3mo (100%), 4–12mo (85%), 13–36mo (65%), 36+mo (50%)</li>
          <li>Rates: US/CA/UK/AU ($0.0042), EU West ($0.0036), LATAM ($0.0018), Asia ($0.0022), ROW ($0.0016)</li>
          <li><strong>API Limitation:</strong> Calculations based on top 10 tracks only</li>
        </ul>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

export default MethodologyNote;