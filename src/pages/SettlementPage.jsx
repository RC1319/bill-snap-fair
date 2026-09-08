import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { api } from "@/services/api";
import { formatMoney, cx, initials } from "@/lib/format";

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-high/15 text-high",
  "bg-mid/15 text-mid",
  "bg-low/15 text-low",
];

export default function SettlementPage() {
  const navigate = useNavigate();
  const { bill, people, result, payments, setPayer, reset } = useSplitFlow();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const { perPerson, settlements, billTotal } = result;
  const payerId = Object.keys(payments)[0] ?? null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveBill({
        ...bill,
        people: people.map((p) => p.id),
        payments,
        status: "pending",
      });
      setSaved(true);
    } catch {
      // ignore for mock
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center rise">
        <div className="w-20 h-20 rounded-full bg-high/12 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-high" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bill saved!
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Your split for {bill.merchant_name || bill.title || "your bill"} has been saved.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              reset();
              navigate({ to: "/dashboard" });
            }}
            className="px-5 py-2.5 rounded-xl bg-card text-foreground font-medium text-sm border border-border hover:bg-card/80 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              reset();
              navigate({ to: "/new/upload" });
            }}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            Split Another Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">Settlement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select who paid the bill, and we'll calculate the settlements.
        </p>
      </div>

      {/* Who paid? */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "80ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Who paid?
        </h3>
        <div className="flex flex-wrap gap-2">
          {people.map((person, i) => {
            const active = payerId === person.id;
            return (
              <button
                key={person.id}
                onClick={() => setPayer(active ? null : person.id)}
                className={cx(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                )}
              >
                <div
                  className={cx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : AVATAR_COLORS[i % AVATAR_COLORS.length]
                  )}
                >
                  {initials(person.name)}
                </div>
                {person.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settlements */}
      {payerId && settlements.length > 0 && (
        <div className="space-y-3 rise" style={{ animationDelay: "160ms" }}>
          <h3 className="text-sm font-semibold text-foreground">
            Who owes whom
          </h3>
          {settlements.map((s, i) => (
            <div
              key={i}
              className="panel-card p-4 flex items-center gap-4 rise"
              style={{ animationDelay: `${(i + 2) * 60}ms` }}
            >
              {/* From */}
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-low/12 text-low flex items-center justify-center text-xs font-bold">
                  {initials(s.from.name)}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {s.from.name}
                </span>
              </div>

              {/* Arrow + amount */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-lg font-bold font-mono text-primary">
                  {formatMoney(s.amount, { precise: true })}
                </span>
                <ArrowRight className="w-4 h-4 text-faint" />
              </div>

              {/* To */}
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-sm font-medium text-foreground">
                  {s.to.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-high/12 text-high flex items-center justify-center text-xs font-bold">
                  {initials(s.to.name)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payer summary */}
      {payerId && (
        <div className="panel-card p-4 rise" style={{ animationDelay: "280ms" }}>
          {perPerson
            .filter((r) => r.person.id === payerId)
            .map((row) => (
              <div key={row.person.id} className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{row.person.name} paid</span>
                  <span className="font-mono text-foreground">{formatMoney(row.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{row.person.name}'s actual share</span>
                  <span className="font-mono text-foreground">{formatMoney(row.total, { precise: true })}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/30 font-bold">
                  <span className="text-foreground">{row.person.name} should receive</span>
                  <span className="font-mono text-high">{formatMoney(row.net, { precise: true })}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 rise">
        <button
          onClick={() => navigate({ to: "/new/summary" })}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSave}
          disabled={!payerId || saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Bill"}
        </button>
      </div>
    </div>
  );
}
