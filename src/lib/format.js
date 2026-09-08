/** Currency + text helpers shared across SplitSnap. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹18,450 — Indian grouping, no paise unless the value has them. */
export function formatMoney(value, { precise = false } = {}) {
  const n = Number(value) || 0;
  const hasPaise = Math.abs(n - Math.round(n)) > 0.004;
  return precise || hasPaise ? inrPrecise.format(n) : inr.format(n);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatShortDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function timeAgo(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return formatShortDate(d);
}

/** high | medium | low band for an extraction confidence (0-100). */
export function confidenceBand(score) {
  const n = Number(score) || 0;
  if (n >= 95) return "high";
  if (n >= 80) return "medium";
  return "low";
}

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
