import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatMoney } from "@/lib/format";
import { Receipt, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { calculateSplit } from "@/services/splitService";
import { peopleByIds } from "@/services/billService";

export default function BillDetailsPage({ billId }) {
  const navigate = useNavigate();
  const { data: bill, isLoading, error } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.getBill(billId),
    enabled: !!billId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="panel-card h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20 rise">
        <Receipt className="w-10 h-10 text-faint mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">Bill not found</h2>
        <button
          onClick={() => navigate({ to: "/bills" })}
          className="text-sm text-primary hover:underline"
        >
          ← Back to bills
        </button>
      </div>
    );
  }

  const people = peopleByIds(bill.people ?? []);
  const result = calculateSplit({
    bill,
    people,
    assignments: bill.assignments ?? {},
    payments: bill.payments ?? {},
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate({ to: "/bills" })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Bills
      </button>

      {/* Header */}
      <div className="panel-card p-6 rise">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{bill.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {bill.merchant} · {bill.category} · Paid by {bill.paidBy?.replace("p_", "")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold font-mono text-primary">
              {formatMoney(bill.total)}
            </p>
            <p className="text-xs text-muted-foreground">{people.length} people</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "80ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Items</h3>
        <div className="space-y-2">
          {bill.items.map((item) => {
            const assignment = bill.assignments?.[item.id];
            const assignedNames = (assignment?.people ?? []).map((id) => id.replace("p_", ""));
            return (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/30">
                <div>
                  <span className="text-sm text-foreground font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {assignedNames.length > 0
                      ? assignedNames.length === people.length
                        ? "Everyone"
                        : assignedNames.join(" + ")
                      : "Unassigned"}
                  </span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">
                  {formatMoney(item.total)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-1 pt-3 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono text-foreground">{formatMoney(bill.subtotal)}</span>
          </div>
          {bill.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST / Tax</span>
              <span className="font-mono text-foreground">{formatMoney(bill.tax)}</span>
            </div>
          )}
          {bill.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Charge</span>
              <span className="font-mono text-foreground">{formatMoney(bill.serviceCharge)}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-mono text-high">−{formatMoney(bill.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border/30">
            <span className="text-foreground">Total</span>
            <span className="font-mono text-primary">{formatMoney(bill.total)}</span>
          </div>
        </div>
      </div>

      {/* Per-person breakdown */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "160ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Individual Breakdown</h3>
        <div className="space-y-3">
          {result.perPerson.map((row) => (
            <div key={row.person.id} className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-sm font-medium text-foreground">{row.person.name}</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {formatMoney(row.total, { precise: true })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements */}
      {result.settlements.length > 0 && (
        <div className="panel-card p-5 rise" style={{ animationDelay: "240ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Settlements</h3>
          <div className="space-y-2">
            {result.settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">
                  {s.from.name} owes {s.to.name}
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  {formatMoney(s.amount, { precise: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
