import { Save, ChevronRight } from "lucide-react";

const SaveButton = ({ hasValidData, isSaving, onSave }) => (
  <div className="flex justify-center pb-6">
    <button
      onClick={onSave}
      disabled={!hasValidData || isSaving}
      className={`
        w-full sm:w-auto inline-flex items-center justify-center gap-3
        px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-black text-white
        shadow-xl transition-all duration-300
        ${hasValidData && !isSaving
          ? "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400"
        }
      `}
    >
      {isSaving ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <Save size={20} />
          Download &amp; Save PDF Report
          {hasValidData && <ChevronRight size={18} className="opacity-70" />}
        </>
      )}
    </button>
  </div>
);

export default SaveButton;