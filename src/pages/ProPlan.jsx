import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProPlan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Upgrade to Pro
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          PDF downloads are available for Pro members only.
        </p>

        <div className="space-y-3 text-left mb-6">
          <p>✔ Download Valuation Reports (PDF)</p>
          <p>✔ Advanced Analytics</p>
          <p>✔ Full Access Features</p>
        </div>

        <button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Upgrade to Pro (Pricing TBD)
        </button>

        <button
          onClick={() => navigate("/valuation")}
          className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700"
        >
          Back to Valuation
        </button>
      </div>
    </div>
  );
}