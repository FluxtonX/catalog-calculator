// src/utils/formatters.js

/**
 * Format number with commas (e.g., 1,234,567)
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format number to billions (e.g., 1.23B)
 */
export const formatToBillions = (num) => {
  if (!num || isNaN(num)) return "0.00B";
  const billions = num / 1000000000;
  return billions.toFixed(2) + "B";
};

/**
 * Format number to millions (e.g., 1.23M)
 */
export const formatToMillions = (num) => {
  if (!num || isNaN(num)) return "0.00M";
  const millions = num / 1000000;
  return millions.toFixed(2) + "M";
};

/**
 * Format as currency with appropriate suffix (e.g., $1.23M, $456K)
 */
export const formatCurrency = (num) => {
  if (!num || isNaN(num)) return "$0";
  if (num >= 1000000) {
    return "$" + formatToMillions(num);
  } else if (num >= 1000) {
    const thousands = num / 1000;
    return "$" + thousands.toFixed(2) + "K";
  }
  return "$" + num.toFixed(2);
};

/**
 * Clean HTML text (remove tags and extra whitespace)
 */
export const cleanHtmlText = (text) => {
  if (!text) return "";
  
  // Remove HTML tags
  let stripped = text.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Decode HTML entities (&#34;, &#39;, &quot;, etc.) using DOMParser
  try {
    const doc = new DOMParser().parseFromString(stripped, "text/html");
    stripped = doc.documentElement.textContent;
  } catch (e) {
    // Fallback if DOMParser is unavailable
  }
  
  return stripped.replace(/\s+/g, " ").trim();
};

/**
 * Parse stream count string to number (handles B, M, K suffixes)
 */
export const parseStreamCount = (streamsStr) => {
  if (!streamsStr) return 0;
  
  const str = String(streamsStr);
  
  if (str.includes("B")) {
    return parseFloat(str.replace("B", "")) * 1000000000 || 0;
  } else if (str.includes("M")) {
    return parseFloat(str.replace("M", "")) * 1000000 || 0;
  } else if (str.includes("K")) {
    return parseFloat(str.replace("K", "")) * 1000 || 0;
  } else {
    return parseFloat(str.replace(/,/g, "")) || 0;
  }
};

export const formatNumberAbbrev = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
};