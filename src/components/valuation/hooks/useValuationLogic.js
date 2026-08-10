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
  if (num === null || num === undefined) return "0";
  const str = Math.round(num).toString();
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
export const formatToMillions = (num) => {
  if (num === null || num === undefined) return "0M";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  return formatNumber(num);
};
export const formatCurrency = (num) => {
  if (num === null || num === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};