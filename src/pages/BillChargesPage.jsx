import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { formatMoney, cx } from "@/lib/format";

export default function BillChargesPage() {
  const navigate = useNavigate();
  const { bill, result } = useSplitFlow();
  const [showCalc, setShowCalc] = useState(false);

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const { perPerson, charges } = result;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">Bill Charges</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Taxes and service charges are distributed proportionally based on each
          person's actual consumption.
        </p>
      </div>

      {/* Charges overview */}
      <div className="panel-card p-5 space-y-3 rise" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Subtotal (items)", value: charges.subtotal },
          { label: "GST / Tax", value: charges.tax },
          { label: "Service Charge", value: charges.service },
          { label: "Other Charges", value: charges.other },
          { label: "Discount", value: -charges.discount, negative: true },
        ]
          .filter((r) => r.value !== 0)
          .map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-1.5 border-b border-border/30"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span
                className={cx(
                  "text-sm font-mono font-semibold",
                  row.negative ? "text-high" : "text-foreground"
                )}
              >
                {row.negative ? "−" : ""}
                {formatMoney(Math.abs(row.value))}
              </span>
            </div>
          ))}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-base font-bold text-foreground">
            Final Total
          </span>
          <span className="text-xl font-bold font-mono text-primary">
            {formatMoney(bill.total)}
          </span>
        </div>
      </div>

      {/* Per-person charge distribution */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Proportional Distribution
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs text-muted-foreground font-medium">Person</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Items</th>
                {charges.tax > 0 && (
                  <th className="pb-2 text-xs text-muted-foreground font-medium text-right">GST</th>
                )}
                {charges.service > 0 && (
                  <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Service</th>
                )}
                {charges.discount > 0 && (
                  <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Discount</th>
                )}
                <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {perPerson.map((row) => (
                <tr key={row.person.id} className="border-b border-border/30">
                  <td className="py-2.5 font-medium text-foreground">
                    {row.person.name}
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">
                    {formatMoney(row.itemsTotal)}
                  </td>
                  {charges.tax > 0 && (
                    <td className="py-2.5 text-right font-mono text-muted-foreground">
                      {formatMoney(row.taxShare, { precise: true })}
                    </td>
                  )}
                  {charges.service > 0 && (
                    <td className="py-2.5 text-right font-mono text-muted-foreground">
                      {formatMoney(row.serviceShare, { precise: true })}
                    </td>
                  )}
                  {charges.discount > 0 && (
                    <td className="py-2.5 text-right font-mono text-high">
                      −{formatMoney(row.discountShare, { precise: true })}
                    </td>
                  )}
                  <td className="py-2.5 text-right font-mono font-bold text-foreground">
                    {formatMoney(row.total, { precise: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How was this calculated? */}
      <div className="rise" style={{ animationDelay: "240ms" }}>
        <button
          onClick={() => setShowCalc(!showCalc)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {showCalc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          How was this calculated?
        </button>
        {showCalc && (
          <div className="panel-card p-4 mt-3 text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Proportional distribution</strong>{" "}
              means each person's share of tax, service charge, and discount is
              calculated based on the ratio of their food consumption to the
              total food consumption.
            </p>
            <p>
              For example, if Rahul consumed ₹600 out of ₹1,760 total food
              (34.1%), Rahul pays 34.1% of the tax and 34.1% of the service
              charge.
            </p>
            <p>
              This ensures people who consumed more pay a proportionally larger
              share of the extra charges — <em>not</em> an equal split.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 rise" style={{ animationDelay: "320ms" }}>
        <button
          onClick={() => navigate({ to: "/new/assign" })}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate({ to: "/new/summary" })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          View Final Split
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
