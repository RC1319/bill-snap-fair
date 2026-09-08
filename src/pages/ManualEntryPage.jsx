import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { emptyBill, newItem, recalcSubtotal, recalcTotal } from "@/services/billService";
import { CATEGORIES } from "@/data/mockBills";
import { formatMoney } from "@/lib/format";

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const { startBill } = useSplitFlow();
  const [bill, setBill] = useState(emptyBill);

  const patch = (updates) => {
    setBill((b) => {
      const next = { ...b, ...updates };
      if (updates.items) next.subtotal = recalcSubtotal(updates.items);
      next.total = recalcTotal(next);
      return next;
    });
  };

  const updateItem = (itemId, itemPatch) => {
    const items = bill.items.map((it) => {
      if (it.id !== itemId) return it;
      const next = { ...it, ...itemPatch };
      if (itemPatch.qty !== undefined || itemPatch.unitPrice !== undefined) {
        next.total = (Number(next.qty) || 0) * (Number(next.unitPrice) || 0);
      }
      return next;
    });
    patch({ items });
  };

  const addItem = () => patch({ items: [...bill.items, newItem()] });
  const removeItem = (id) => patch({ items: bill.items.filter((it) => it.id !== id) });

  const handleContinue = () => {
    startBill({ ...bill, confidence: {}, manual: true });
    navigate({ to: "/new/people" });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">
          Enter bill manually
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the bill details and items, then continue to split.
        </p>
      </div>

      {/* Bill info */}
      <div className="panel-card p-5 space-y-4 rise" style={{ animationDelay: "80ms" }}>
        <h3 className="text-sm font-semibold text-foreground">Bill Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium">Bill Name</label>
            <input
              value={bill.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Restaurant Dinner"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-faint outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Merchant</label>
            <input
              value={bill.merchant}
              onChange={(e) => patch({ merchant: e.target.value })}
              placeholder="e.g. Urban Spice"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-faint outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Date</label>
            <input
              type="date"
              value={bill.date}
              onChange={(e) => patch({ date: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Category</label>
            <select
              value={bill.category}
              onChange={(e) => patch({ category: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="panel-card p-5 rise" style={{ animationDelay: "160ms" }}>
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

        {bill.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">No items yet.</p>
            <button
              onClick={addItem}
              className="text-sm font-medium text-primary hover:underline"
            >
              + Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bill.items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2 group">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-faint outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })}
                  className="w-16 px-2 py-2 rounded-lg bg-card border border-border text-sm text-foreground text-center font-mono outline-none focus:border-primary"
                  min={1}
                  placeholder="Qty"
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                  className="w-24 px-2 py-2 rounded-lg bg-card border border-border text-sm text-foreground text-right font-mono outline-none focus:border-primary"
                  placeholder="Price"
                />
                <span className="w-20 text-right text-sm font-mono font-semibold text-foreground">
                  {formatMoney(item.total)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded text-faint hover:text-low hover:bg-low/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charges */}
      <div className="panel-card p-5 space-y-3 rise" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground">Charges</h3>
        {[
          { label: "GST / Tax", key: "tax" },
          { label: "Service Charge", key: "serviceCharge" },
          { label: "Discount", key: "discount" },
          { label: "Other Charges", key: "otherCharges" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                value={bill[row.key]}
                onChange={(e) => patch({ [row.key]: Number(e.target.value) || 0 })}
                className="w-24 px-2 py-1 rounded bg-card border border-border text-sm text-foreground text-right font-mono outline-none focus:border-primary"
              />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-xl font-bold font-mono text-primary">
            {formatMoney(bill.total)}
          </span>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end pt-4 rise" style={{ animationDelay: "320ms" }}>
        <button
          onClick={handleContinue}
          disabled={bill.items.length === 0 || !bill.name}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Split
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
