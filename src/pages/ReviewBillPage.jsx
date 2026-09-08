import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { newItem } from "@/services/billService";
import { auditBill } from "@/services/splitService";
import { formatMoney, cx, formatDate } from "@/lib/format";
import ConfidenceBadge from "@/components/common/ConfidenceBadge";

function EditableField({ label, value, confidence, onChange, type = "text", prefix }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) || 0 : e.target.value)}
          className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-sm text-foreground py-1 transition-colors font-mono"
        />
        {confidence !== undefined && <ConfidenceBadge score={confidence} showLabel={false} />}
      </div>
    </div>
  );
}

export default function ReviewBillPage() {
  const navigate = useNavigate();
  const { bill, receiptUrl, patchBill, setItems, setConfirmed } = useSplitFlow();
  const [editingItems, setEditingItems] = useState(false);

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const issues = auditBill(bill);

  const updateItem = (itemId, patch) => {
    const items = bill.items.map((it) => {
      if (it.id !== itemId) return it;
      const next = { ...it, ...patch };
      if (patch.qty !== undefined || patch.unitPrice !== undefined) {
        next.total = (Number(next.qty) || 0) * (Number(next.unitPrice) || 0);
      }
      return next;
    });
    setItems(items);
  };

  const addItem = () => {
    setItems([...bill.items, newItem()]);
  };

  const removeItem = (itemId) => {
    setItems(bill.items.filter((it) => it.id !== itemId));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    navigate({ to: "/new/people" });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">Review your bill</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check the extracted information before we calculate the split.
        </p>
      </div>

      {/* Audit issues */}
      {issues.length > 0 && (
        <div className="space-y-2 rise">
          {issues.map((issue, i) => (
            <div
              key={i}
              className={cx(
                "panel-card p-3 flex items-start gap-3 text-sm",
                issue.level === "error"
                  ? "border border-low/30 bg-low/5"
                  : "border border-mid/30 bg-mid/5"
              )}
            >
              <AlertTriangle
                className={cx(
                  "w-4 h-4 shrink-0 mt-0.5",
                  issue.level === "error" ? "text-low" : "text-mid"
                )}
              />
              <span className="text-muted-foreground">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Receipt preview */}
        {receiptUrl && (
          <div className="lg:col-span-2 rise">
            <div className="panel-card p-4 sticky top-20">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Original Receipt
              </h3>
              <img
                src={receiptUrl}
                alt="Uploaded receipt"
                className="w-full rounded-lg object-contain max-h-[500px] bg-background"
              />
            </div>
          </div>
        )}

        {/* Right: Extracted data */}
        <div className={cx("space-y-6", receiptUrl ? "lg:col-span-3" : "lg:col-span-5")}>
          {/* Bill metadata */}
          <div className="panel-card p-5 space-y-4 rise">
            <h3 className="text-sm font-semibold text-foreground">Bill Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableField
                label="Merchant"
                value={bill.merchant}
                confidence={bill.confidence?.merchant}
                onChange={(v) => patchBill({ merchant: v })}
              />
              <EditableField
                label="Date"
                value={bill.date}
                type="date"
                confidence={bill.confidence?.date}
                onChange={(v) => patchBill({ date: v })}
              />
              <EditableField
                label="Bill Name"
                value={bill.name}
                onChange={(v) => patchBill({ name: v })}
              />
              <EditableField
                label="Category"
                value={bill.category}
                onChange={(v) => patchBill({ category: v })}
              />
            </div>
          </div>

          {/* Items table */}
          <div className="panel-card p-5 rise" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Items</h3>
              <button
                onClick={addItem}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Item</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium w-16 text-center">Qty</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium w-24 text-right">Unit Price</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium w-24 text-right">Total</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium w-20 text-center">Conf.</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 group">
                      <td className="py-2.5 pr-2">
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="bg-transparent outline-none text-foreground w-full"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })}
                          className="bg-transparent outline-none text-foreground w-12 text-center font-mono"
                          min={1}
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                          className="bg-transparent outline-none text-foreground w-20 text-right font-mono"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                        {formatMoney(item.total)}
                      </td>
                      <td className="py-2.5 text-center">
                        <ConfidenceBadge score={item.confidence} showLabel={false} />
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-low hover:bg-low/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="panel-card p-5 space-y-3 rise" style={{ animationDelay: "160ms" }}>
            <h3 className="text-sm font-semibold text-foreground">Charges</h3>
            <div className="space-y-2">
              {[
                { label: "Subtotal", key: "subtotal", confidence: bill.confidence?.subtotal },
                { label: "GST / Tax", key: "tax", confidence: bill.confidence?.tax },
                { label: "Service Charge", key: "serviceCharge", confidence: bill.confidence?.serviceCharge },
                { label: "Discount", key: "discount", confidence: bill.confidence?.discount },
                { label: "Other Charges", key: "otherCharges", confidence: bill.confidence?.otherCharges },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between py-1.5 border-b border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    {row.confidence !== undefined && (
                      <ConfidenceBadge score={row.confidence} showLabel={false} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={bill[row.key] ?? 0}
                      onChange={(e) => patchBill({ [row.key]: Number(e.target.value) || 0 })}
                      className="bg-transparent outline-none text-sm text-foreground w-24 text-right font-mono"
                    />
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-bold font-mono text-primary">
                  {formatMoney(bill.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm */}
          <div className="flex justify-end gap-3 rise" style={{ animationDelay: "240ms" }}>
            <button
              onClick={() => navigate({ to: "/new/upload" })}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
