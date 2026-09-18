// src/components/artist/BioText.jsx
import React, { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { cleanHtmlText } from "../../utils/formatters";

/**
 * Expandable biography text component
 * @param {Object} props
 * @param {string} props.text - Biography HTML text
 */
const BioText = ({ text, forceLightMode }) => {
  const [expanded, setExpanded] = useState(false);

  const formatParagraphs = (rawText) => {
    if (!rawText) return "";
    // If it already has HTML paragraphs, just return it
    if (rawText.includes("<p>") || rawText.includes("<br")) return rawText;
    
    // Split by newlines if they exist
    if (rawText.includes("\n")) {
      return rawText.split("\n").filter(p => p.trim()).map(p => `<p>${p}</p>`).join("");
    }

    // It's a massive string. Split by sentences and group them.
    const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
    let html = "";
    let currentParagraph = "";
    
    sentences.forEach(sentence => {
      currentParagraph += sentence + " ";
      if (currentParagraph.length > 300) {
        html += `<p>${currentParagraph.trim()}</p>`;
        currentParagraph = "";
      }
    });
    
    if (currentParagraph.trim()) {
      html += `<p>${currentParagraph.trim()}</p>`;
    }
    
    return html;
  };

  const cleanText = useMemo(() => cleanHtmlText(text), [text]);
  const formattedHtml = useMemo(() => formatParagraphs(text), [text]);
  const isLongText = cleanText.length > 300;

  return (
    <div className={`leading-relaxed text-slate-700 ${forceLightMode ? '' : 'dark:text-slate-300'}`}>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isLongText && !expanded ? "line-clamp-5" : "line-clamp-none"
        } [&>p]:mb-3 last:[&>p]:mb-0 [&>a]:text-emerald-500 hover:[&>a]:underline`}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
      {isLongText && (
        <button
          className={`mt-3 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 group ${forceLightMode ? '' : 'dark:text-emerald-400 dark:hover:text-emerald-300'}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronRight
            size={14}
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      )}
    </div>
  );
};

export default BioText;
