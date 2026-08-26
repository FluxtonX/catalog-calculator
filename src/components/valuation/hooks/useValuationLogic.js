// All calculation logic extracted — zero changes to original logic
import { useMemo } from "react";

export const RATE_BY_REGION = {
  US_CA_UK_AU: 0.0042,
  EU_WEST: 0.0036,
  LATAM: 0.0018,
  ASIA: 0.0022,
  ROW: 0.0016,
};
export const DEFAULT_SPOTIFY_RATE = 0.0035;

import {
  calculateGeoWeightedRate,
  getLifetimeStreams,
  getAverageReleaseDate,
  getDecayFactor,
  getMonthsBetween
} from "../../../utils/calculations";

export {
  calculateGeoWeightedRate,
  getLifetimeStreams,
  getAverageReleaseDate,
  getDecayFactor,
  getMonthsBetween
};

// Formatters
export const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return "0";
  if (typeof num === "string" && (num.includes("M") || num.includes("K") || num.includes(","))) return num;
  const parsed = Number(num);
  if (isNaN(parsed)) return num;
  const str = Math.round(parsed).toString();
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
export const formatToMillions = (num) => {
  if (num === null || num === undefined || num === '') return "0";
  if (typeof num === "string" && (num.includes("M") || num.includes("K") || num.includes("B") || num.includes(","))) return num;
  const parsed = Number(num);
  if (isNaN(parsed)) return num;
  
  if (parsed >= 1000000000) {
    let formatted = (parsed / 1000000000).toFixed(1);
    if (formatted.endsWith(".0")) formatted = formatted.slice(0, -2);
    return formatted + "B";
  } else if (parsed >= 1000000) {
    let formatted = (parsed / 1000000).toFixed(1);
    if (formatted.endsWith(".0")) formatted = formatted.slice(0, -2);
    return formatted + "M";
  } else if (parsed >= 1000) {
    let formatted = (parsed / 1000).toFixed(1);
    if (formatted.endsWith(".0")) formatted = formatted.slice(0, -2);
    return formatted + "K";
  }
  return formatNumber(parsed);
};
export const formatCurrency = (num) => {
  if (num === null || num === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};