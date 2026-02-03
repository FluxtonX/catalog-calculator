// src/components/artist/BioText.jsx
import React, { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cleanHtmlText } from "../../utils/formatters";

/**
 * Expandable biography text component
 * @param {Object} props
 * @param {string} props.text - Biography HTML text
 */
const BioText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  const cleanText = useMemo(() => cleanHtmlText(text), [text]);

  return (
    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
      <p
        className={`transition-all duration-300 ${
          expanded ? "line-clamp-none" : "line-clamp-5"
        }`}
      >
        {cleanText}
      </p>
      <button
        className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 group"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Read more"}
        <ChevronRight
          size={14}
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>
    </div>
  );
};

export default BioText;