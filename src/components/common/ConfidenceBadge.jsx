import { cx, confidenceBand } from "@/lib/format";

export default function ConfidenceBadge({ score, showLabel = true }) {
  const band = confidenceBand(score);
  const n = Number(score) || 0;

  const config = {
    high: { icon: "✓", label: "High confidence", cls: "text-high bg-high/12" },
    medium: { icon: "⚠", label: "Medium", cls: "text-mid bg-mid/12" },
    low: { icon: "⚠", label: "Low confidence — Please verify", cls: "text-low bg-low/12 pulse-ring" },
  };

  const c = config[band];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        c.cls
      )}
      title={c.label}
    >
      <span>{c.icon}</span>
      <span className="font-mono">{n}%</span>
      {showLabel && band === "low" && (
        <span className="text-[10px] font-normal opacity-80">Verify</span>
      )}
    </span>
  );
}
