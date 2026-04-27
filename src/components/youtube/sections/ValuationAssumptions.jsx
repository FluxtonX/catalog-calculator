import { Settings, BarChart, DollarSign, Play } from "lucide-react";
import InputSlider from "../ui/InputSlider";

const ValuationAssumptions = ({
  annualViewPercentage, setAnnualViewPercentage,
  monetizationRate, setMonetizationRate,
  avgCpm, setAvgCpm,
  creatorCut, setCreatorCut,
  streamingRate, setStreamingRate,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
        <Settings size={18} className="text-white" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Valuation Assumptions
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Adjust sliders to model different scenarios
        </p>
      </div>
    </div>

    <div className="p-5 sm:p-7">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Ad Revenue Inputs */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <BarChart size={14} className="text-red-500" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Ad Revenue
            </h4>
          </div>
          <InputSlider
            label="Annual Views % of Total"
            value={annualViewPercentage}
            onValueChange={setAnnualViewPercentage}
            min={0} max={100} step={1} unit="%"
            tooltip="Percentage of lifetime views that occur within a given year."
          />
          <InputSlider
            label="Monetization Rate"
            value={monetizationRate}
            onValueChange={setMonetizationRate}
            min={0} max={100} step={1} unit="%"
            tooltip="Percentage of views that are monetized with ads."
          />
        </div>

        {/* Financial Inputs */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign size={14} className="text-emerald-500" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Financial
            </h4>
          </div>
          <InputSlider
            label="Average Music CPM"
            value={avgCpm}
            onValueChange={setAvgCpm}
            min={0.5} max={5} step={0.1}
            format={(v) => `$${v.toFixed(2)}`}
            tooltip="Cost per thousand impressions for music content."
          />
          <InputSlider
            label="Creator Cut"
            value={creatorCut}
            onValueChange={setCreatorCut}
            min={40} max={100} step={1} unit="%"
            tooltip="Percentage of gross ad revenue the creator receives after YouTube's share."
          />
        </div>

        {/* Streaming Inputs */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Play size={14} className="text-blue-500" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Streaming
            </h4>
          </div>
         <InputSlider
  label="Streaming Rate / Play"
  value={streamingRate}
  onValueChange={setStreamingRate}
  min={0.001} max={0.010} step={0.0001}
  format={(v) => `$${v.toFixed(4)}`}
  tooltip="Industry average is ~$0.0054/play for YouTube Content ID. Ranges from $0.001 (low) to $0.010 (premium). Adjust to match your actual Content ID rate."
/>
        </div>
      </div>
    </div>
  </div>
);

export default ValuationAssumptions;