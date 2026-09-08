import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Receipt, Users, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { formatMoney, cx, initials } from "@/lib/format";

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-high/15 text-high",
  "bg-mid/15 text-mid",
  "bg-low/15 text-low",
];

export default function BillSummaryPage() {
  const navigate = useNavigate();
  const { bill, people, result } = useSplitFlow();
  const [expanded, setExpanded] = useState({});

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const { perPerson, billTotal } = result;

  const toggle = (id) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">
          Your split is ready
        </h1>
      </div>

      {/* Summary card */}
      <div className="panel-card p-6 text-center rise" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Bill
            </p>
            <p className="text-3xl font-extrabold font-mono text-primary mt-1">
              {formatMoney(billTotal)}
            </p>
          </div>
          <div className="w-px h-10 bg-border hidden sm:block" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              People
            </p>
            <p className="text-3xl font-extrabold font-mono text-foreground mt-1">
              {people.length}
            </p>
          </div>
        </div>
      </div>

      {/* Per-person cards */}
      <div className="space-y-3">
        {perPerson.map((row, i) => {
          const open = expanded[row.person.id];
          return (
            <div
              key={row.person.id}
              className="panel-card overflow-hidden rise"
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
            >
              <button
                onClick={() => toggle(row.person.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-card/80 transition-colors"
              >
                <div
                  className={cx(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  )}
                >
                  {initials(row.person.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {row.person.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.items.length} items ·{" "}
                    {Math.round(row.ratio * 100)}% of consumption
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-foreground">
                    {formatMoney(row.total, { precise: true })}
                  </span>
                  {open ? (
                    <ChevronUp className="w-4 h-4 text-faint" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-faint" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {open && (
                <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-2">
                  {/* Items */}
                  {row.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="text-muted-foreground">{it.name}</span>
                      <span className="font-mono text-foreground">
                        {formatMoney(it.amount, { precise: true })}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border/30 pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items subtotal</span>
                      <span className="font-mono text-foreground">
                        {formatMoney(row.itemsTotal, { precise: true })}
                      </span>
                    </div>
                    {row.taxShare > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST / Tax</span>
                        <span className="font-mono text-foreground">
                          {formatMoney(row.taxShare, { precise: true })}
                        </span>
                      </div>
                    )}
                    {row.serviceShare > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Charge</span>
                        <span className="font-mono text-foreground">
                          {formatMoney(row.serviceShare, { precise: true })}
                        </span>
                      </div>
                    )}
                    {row.discountShare > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-mono text-high">
                          −{formatMoney(row.discountShare, { precise: true })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/30">
                      <span className="text-foreground">Total</span>
                      <span className="font-mono text-primary">
                        {formatMoney(row.total, { precise: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 rise">
        <button
          onClick={() => navigate({ to: "/new/charges" })}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate({ to: "/new/settlement" })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          Settlement
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
