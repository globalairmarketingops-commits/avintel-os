// =====================================================================
// Av/IntelOS — Confidence Model (ported from confidence.js)
// CONFIRMED / PROBABLE / POSSIBLE classification with 30-day decay.
// =====================================================================

import type { ConfidenceLevel, DataSource } from "../types";

const DECAY_CONFIRMED_TO_PROBABLE = 30;
const DECAY_PROBABLE_TO_POSSIBLE = 60;

const SOURCE_BASE: Record<string, ConfidenceLevel> = {
  windsor_live: "CONFIRMED",
  api_direct: "CONFIRMED",
  csv_upload: "CONFIRMED",
  manual: "CONFIRMED",
  calculated: "PROBABLE",
  seed: "POSSIBLE",
  unknown: "POSSIBLE",
};

export function classify(source: DataSource | string, ageInDays?: number): ConfidenceLevel {
  const age = ageInDays ?? 999;
  let level = SOURCE_BASE[source] ?? "POSSIBLE";

  if (level === "CONFIRMED" && age > DECAY_CONFIRMED_TO_PROBABLE) {
    level = "PROBABLE";
  }
  if (level === "PROBABLE" && age > DECAY_PROBABLE_TO_POSSIBLE) {
    level = "POSSIBLE";
  }

  return level;
}

export function min(levels: ConfidenceLevel[]): ConfidenceLevel {
  const priority: Record<ConfidenceLevel, number> = {
    CONFIRMED: 1,
    PROBABLE: 2,
    POSSIBLE: 3,
  };
  let worst: ConfidenceLevel = "CONFIRMED";
  for (const l of levels) {
    if ((priority[l] ?? 3) > priority[worst]) worst = l;
  }
  return worst;
}

export function getConfidenceColor(level: ConfidenceLevel) {
  switch (level) {
    case "CONFIRMED": return { bg: "#f0fdf4", text: "#3a5c00", border: "#bbf7d0" };
    case "PROBABLE":  return { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" };
    case "POSSIBLE":  return { bg: "#fffbeb", text: "#92400e", border: "#fde68a" };
  }
}
